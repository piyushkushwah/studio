
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth, useUser } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { CalendarCell } from "@/components/calendar-cell";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { LabelManager } from "@/components/label-manager";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { FocusPlayer } from "@/components/focus-player";
import { AppTour } from "@/components/app-tour";
import { FloatButtonGroup } from "@/components/float-button-group";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay,
  getHours
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Search,
  FilterX,
  Target,
  Trash2,
  Quote,
  Trophy,
  Flame,
  Star,
  Layout,
  Loader2,
  AlertTriangle,
  Moon,
  Sun,
  Sparkles,
  LogOut,
  Clock,
  BarChart2
} from "lucide-react";
import Link from "next/link";
import { Task, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getRandomQuote } from "@/lib/quotes";
import { useToast } from "@/hooks/use-toast";
import { generateDailyBriefing } from "@/ai/flows/daily-briefing-flow";

const HEADER_NAV_ITEMS = [
  { title: "Time Log", url: "/time-tracking", icon: Clock, color: "text-primary" },
  { title: "Stats", url: "/analytics", icon: BarChart2, color: "text-primary" },
];

export default function DailyTaskTrack() {
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { tasks, addTask, updateTask, deleteTask, toggleTask, labels, isInitialized, dailyGoals, setDailyGoal, streak } = useTasks();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Hello");
  const [quote, setQuote] = useState<string | null>(null);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dailyBriefing, setDailyBriefing] = useState<string | null>(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogin = async () => {
    if (!auth) {
      toast({ variant: "destructive", title: "Error", description: "Firebase Auth not initialized." });
      return;
    }
    
    setIsAuthProcessing(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Welcome!", description: "Logged in successfully." });
    } catch (error: any) {
      console.error("Login Error:", error);
      let message = error.message || "Could not sign in.";
      
      if (error.code === 'auth/popup-closed-by-user') {
        message = "The login window was closed before completion. Please try again.";
      } else if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        message = `This domain (${domain}) is not authorized for Google Sign-in.`;
        setAuthError(domain);
      } else if (error.code === 'auth/popup-blocked') {
        message = "Popup blocked by browser. Please allow popups for this site.";
      }

      toast({ 
        variant: "destructive", 
        title: "Sign In Failed", 
        description: message,
        duration: 8000
      });
    } finally {
      setIsAuthProcessing(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    toast({ title: "Signed Out", description: "Successfully logged out." });
  };

  const fetchDailyBriefing = async () => {
    if (!user) return;
    setIsGeneratingBriefing(true);
    try {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const todayTasks = tasks.filter(t => t.dueDate === todayStr);
      const result = await generateDailyBriefing({
        userName: user.displayName?.split(' ')[0] || 'User',
        tasks: todayTasks.slice(0, 5).map(t => t.description),
        completedCount: todayTasks.filter(t => t.completed).length,
        streak: streak,
      });
      setDailyBriefing(result.briefing);
    } catch (error) {
      console.error("Briefing Failed", error);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const fetchNewQuote = useCallback(async () => {
    const newQuote = await getRandomQuote();
    setQuote(newQuote);
  }, []);

  useEffect(() => {
    const hour = getHours(new Date());
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    
    fetchNewQuote();
    const intervalId = setInterval(fetchNewQuote, 60000);
    return () => clearInterval(intervalId);
  }, [fetchNewQuote]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  
  const dailyTasks = useMemo(() => {
    let filtered = tasks.filter((t) => t.dueDate === selectedDateStr);
    if (searchQuery) {
      filtered = filtered.filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeLabelFilter) {
      filtered = filtered.filter(t => t.label === activeLabelFilter);
    }
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const weightA = priorityWeight[a.priority || 'medium'];
      const weightB = priorityWeight[b.priority || 'medium'];
      return weightB - weightA;
    });
  }, [tasks, selectedDateStr, searchQuery, activeLabelFilter]);

  const dailyGoalValue = dailyGoals[selectedDateStr] || 0;
  const completedCount = dailyTasks.filter(t => t.completed).length;
  const goalMet = dailyGoalValue > 0 && completedCount >= dailyGoalValue;

  useEffect(() => {
    if (goalMet && isInitialized && user) {
      const lastCelebrated = localStorage.getItem(`celebrated_${selectedDateStr}_${user.uid}`);
      if (!lastCelebrated) {
        toast({ title: "Goal Reached! 🎉", description: `You've completed your goal of ${dailyGoalValue} tasks for today.` });
        localStorage.setItem(`celebrated_${selectedDateStr}_${user.uid}`, "true");
      }
    }
  }, [goalMet, selectedDateStr, dailyGoalValue, toast, isInitialized, user]);

  const handleTaskSubmit = (taskData: { description: string; notes?: string; dueDate: string; label?: string; priority?: Priority }) => {
    if (editingTask) updateTask(editingTask.id, taskData);
    else addTask({ ...taskData, completed: false });
    setEditingTask(null);
  };

  const clearCompleted = () => {
    dailyTasks.filter(t => t.completed).forEach(t => deleteTask(t.id));
  };

  const completionRate = dailyTasks.length > 0 ? (completedCount / dailyTasks.length) * 100 : 0;

  if (authLoading || (isAuthProcessing && !authError) || (user && !isInitialized)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="space-y-1">
            <p className="text-lg font-bold text-primary">
              {authLoading || isAuthProcessing ? "Authenticating..." : "Building your workspace..."}
            </p>
            <p className="text-sm text-muted-foreground">Connecting to secure cloud storage...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-8 shadow-2xl rounded-[2.5rem] border-border bg-card/80 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <div className="bg-primary/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto text-primary shadow-inner">
            <Layout className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-primary tracking-tight">DailyTaskTrack</h2>
            <p className="text-muted-foreground font-medium px-4">Professional Productivity Command Center.</p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleLogin}
              className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-3 group transition-all active:scale-[0.98]"
              disabled={isAuthProcessing || !auth}
            >
              {isAuthProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            {authError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-left space-y-2 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Whitelisting Required
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The domain <strong>{authError}</strong> is not authorized. Go to Firebase Console &gt; Authentication &gt; Settings and add it to the &quot;Authorized Domains&quot; list.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground/30 py-2">
              <div className="h-px bg-current flex-1" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Cloud Sync</span>
              <div className="h-px bg-current flex-1" />
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Google Authentication • Real-time Sync</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center overflow-x-hidden animate-in fade-in duration-700">
      <AppTour />
      <FloatButtonGroup />
      
      <header className="w-full max-w-6xl flex flex-col gap-8 mb-8 md:mb-12 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-xl shadow-primary/20 shrink-0 hidden md:block">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary leading-tight truncate">{greeting}, {user.displayName?.split(' ')[0]}</h1>
                {streak > 0 && (
                  <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-800/30 shrink-0">
                    <Flame className="w-3 h-3 fill-current" />
                    {streak}
                  </div>
                )}
              </div>
              <div className="mt-1 flex flex-col gap-1">
                {dailyBriefing ? (
                  <div className="flex items-start gap-2 bg-primary/5 p-2 rounded-xl border border-primary/10 animate-in slide-in-from-left-2 max-w-md">
                    <Sparkles className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                    <p className="text-[10px] font-bold text-primary/80 leading-relaxed italic pr-8">{dailyBriefing}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Quote className="w-3 h-3 text-accent shrink-0" />
                    {quote ? <p className="text-xs italic text-muted-foreground font-medium truncate">{quote}</p> : <Skeleton className="h-2 w-[180px]" />}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 rounded-full hover:bg-primary/10" 
                      onClick={fetchDailyBriefing}
                      disabled={isGeneratingBriefing}
                    >
                      {isGeneratingBriefing ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : <Sparkles className="w-3 h-3 text-primary" />}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-12 w-12 rounded-2xl bg-card border shadow-sm">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-12 w-12 rounded-2xl bg-card border shadow-sm text-muted-foreground hover:text-destructive">
              <LogOut className="w-5 h-5" />
            </Button>
            <FocusPlayer />
            <PomodoroTimer />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 p-1 bg-card/50 backdrop-blur-sm border rounded-2xl shadow-sm w-full max-w-lg mx-auto">
          <div className="flex items-center flex-1 gap-1 md:gap-2">
            {HEADER_NAV_ITEMS.map((item) => (
              <Link key={item.title} href={item.url} className="flex-1 min-w-0">
                <Button variant="ghost" className="w-full h-9 gap-2 rounded-xl hover:bg-primary/5 transition-all px-2">
                  <item.icon className={cn("w-3.5 h-3.5 shrink-0", item.color)} />
                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">{item.title}</span>
                </Button>
              </Link>
            ))}
            <div className="flex-1 min-w-0">
              <LabelManager />
            </div>
          </div>
          <div className="px-2 border-l border-border/50 h-6 flex items-center">
            <Avatar className="h-7 w-7 border-2 border-background shadow-sm ring-2 ring-primary/5">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">
                {user.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch flex-1 min-h-0">
        <div className="lg:col-span-7 flex flex-col gap-8 w-full">
          <Card className="p-6 md:p-10 shadow-2xl shadow-primary/5 bg-card border-border rounded-[2rem] h-full">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight">{format(currentMonth, "MMMM yyyy")}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-10 w-10 bg-card shadow-sm rounded-xl"><ChevronLeft className="w-5 h-5" /></Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-10 w-10 bg-card shadow-sm rounded-xl"><ChevronRight className="w-5 h-5" /></Button>
              </div>
            </div>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (<div key={day} className="text-center text-[11px] font-black text-muted-foreground/50 py-3 uppercase tracking-[0.2em]">{day}</div>))}
              {days.map((day) => (<CalendarCell key={day.toISOString()} date={day} currentMonth={currentMonth} isSelected={isSameDay(day, selectedDate)} tasks={tasks} onClick={() => setSelectedDate(day)} />))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 flex flex-col w-full h-[600px] lg:h-[calc(100vh-14rem)] lg:sticky lg:top-8 min-h-0">
          <Card className={cn("p-6 md:p-8 shadow-2xl transition-all duration-500 flex flex-col bg-card border-border rounded-[2rem] overflow-hidden h-full", goalMet ? "shadow-accent/10 border-accent/20 ring-1 ring-accent/10" : "shadow-primary/5")}>
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/20" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={126} strokeDashoffset={126 - (126 * completionRate) / 100} className={cn("transition-all duration-1000 ease-in-out", goalMet ? "text-accent" : "text-primary")} />
                  </svg>
                  <span className={cn("absolute text-[10px] font-black", goalMet ? "text-accent" : "text-primary")}>{goalMet ? <Star className="w-3 h-3 fill-current" /> : `${Math.round(completionRate)}%`}</span>
                </div>
                <div className="flex flex-col text-primary">
                  <h3 className="text-xl md:text-2xl font-black tracking-tight leading-none">{format(selectedDate, "EEEE")}</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{format(selectedDate, "do MMMM")}</p>
                </div>
              </div>
              <Button onClick={() => { setEditingTask(null); setIsTaskDialogOpen(true); }} size="icon" className="rounded-2xl h-12 w-12 shadow-xl shadow-primary/20 shrink-0"><Plus className="w-6 h-6" /></Button>
            </div>

            <div className="space-y-4 mb-6 shrink-0">
              <div className={cn("flex items-center gap-3 p-3 rounded-2xl border transition-colors", goalMet ? "bg-accent/5 border-accent/20" : "bg-primary/5 border-primary/10")}>
                <div className={cn("p-2 rounded-lg shadow-sm transition-colors shrink-0", goalMet ? "bg-accent text-white" : "bg-background text-primary")}><Trophy className="w-3.5 h-3.5" /></div>
                <div className="flex-1">
                  <p className={cn("text-[9px] font-black uppercase tracking-widest", goalMet ? "text-accent" : "text-primary/60")}>Goal</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{completedCount} / {dailyGoalValue || 0}</span>
                    <input type="number" min="0" max="20" value={dailyGoalValue} onChange={(e) => setDailyGoal(selectedDateStr, parseInt(e.target.value) || 0)} className="w-12 h-6 text-[10px] font-bold text-center border-none bg-background shadow-sm rounded-lg outline-none" />
                  </div>
                </div>
              </div>
              <div className="relative group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary" /><input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 h-10 bg-muted/20 border-transparent rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/20" /></div>
              <div className="flex flex-wrap gap-1.5 items-center">
                <Button variant={activeLabelFilter === null ? "default" : "outline"} size="sm" onClick={() => setActiveLabelFilter(null)} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg">All</Button>
                {labels.map(l => (<Button key={l.id} variant={activeLabelFilter === l.name ? "default" : "outline"} size="sm" onClick={() => setActiveLabelFilter(l.name === activeLabelFilter ? null : l.name)} className={cn("h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg", activeLabelFilter === l.name ? l.color : "hover:border-primary/30")}>{l.name}</Button>))}
              </div>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2 min-h-0">
              <div className="space-y-3 pb-4">
                {dailyTasks.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground/20">{searchQuery || activeLabelFilter ? <FilterX className="w-6 h-6" /> : <Target className="w-6 h-6" />}</div>
                    <p className="text-xs text-muted-foreground font-bold">{searchQuery || activeLabelFilter ? "No matches found." : "No tasks scheduled."}</p>
                  </div>
                ) : (
                  dailyTasks.map((task) => (<TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onEdit={(t) => { setEditingTask(t); setIsTaskDialogOpen(true); }} />))
                )}
              </div>
            </ScrollArea>

            {dailyTasks.length > 0 && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between shrink-0">
                <span className="text-[10px] font-black text-primary tracking-tight uppercase">{completedCount} / {dailyTasks.length} DONE</span>
                {dailyTasks.some(t => t.completed) && (<Button variant="ghost" size="sm" onClick={clearCompleted} className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold h-8 px-3 rounded-lg text-[10px] uppercase"><Trash2 className="w-3 h-3 mr-1.5" />Clear</Button>)}
              </div>
            )}
          </Card>
        </div>
      </main>

      <TaskDialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen} onSubmit={handleTaskSubmit} initialTask={editingTask} defaultDate={selectedDateStr} />
    </div>
  );
}
