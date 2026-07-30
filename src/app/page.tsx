"use client";

import { useState, useMemo, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth, useUser } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { CalendarCell } from "@/components/calendar-cell";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  FilterX,
  Target,
  Trash2,
  Trophy,
  Star,
  Layout,
  Loader2,
  AlertTriangle,
  Clock,
  BarChart2,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight
} from "lucide-react";
import { Task, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function DailyTaskTrack() {
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { tasks, addTask, updateTask, deleteTask, toggleTask, labels, isInitialized, dailyGoals, setDailyGoal } = useTasks();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { toast } = useToast();

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
      toast({ title: "Welcome back!", description: "Accessing command center..." });
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
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center overflow-hidden relative selection:bg-primary/20 selection:text-primary">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-sky-400/10 rounded-full blur-[120px] animate-pulse delay-700" />
          <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] animate-bounce duration-[10s]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>

        <div className="container max-w-7xl px-4 md:px-8 z-10">
          <header className="absolute top-0 left-0 w-full p-8 flex items-center justify-between">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tighter text-primary">DailyTaskTrack</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status: Operational</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Cloud Connected</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center pt-20 pb-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <Badge className="bg-primary/5 text-primary border-primary/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] w-fit">
                  Version 2.0.4 Release
                </Badge>
                <h1 className="text-6xl md:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] text-slate-900">
                  Design your <br />
                  <span className="text-primary">success path.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
                  A high-performance workspace engineered for clarity. Sync your missions, master your focus, and track your evolution in real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Clock, title: "Precision Focus", color: "text-blue-600" },
                  { icon: Globe, title: "Global Sync", color: "text-sky-600" },
                  { icon: BarChart2, title: "Insight Engine", color: "text-purple-600" },
                  { icon: ShieldCheck, title: "Secure Core", color: "text-emerald-600" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-primary/20 transition-colors group">
                    <item.icon className={cn("w-5 h-5", item.color)} />
                    <span className="text-sm font-bold text-slate-700">{item.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Card className="relative bg-white border-slate-100 shadow-[0_32px_64px_-16px_rgba(37,99,235,0.1)] p-8 md:p-12 rounded-[2.5rem] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                
                <div className="space-y-10">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/5 rounded-3xl mb-4 border border-primary/10">
                      <Layout className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Welcome Back</h2>
                    <p className="text-slate-400 text-sm font-medium">Log in to your command center to resume your daily mission.</p>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      onClick={handleLogin}
                      disabled={isAuthProcessing || !auth}
                      className="w-full h-16 rounded-2xl text-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group"
                    >
                      {isAuthProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          Continue with Google
                          <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                        </>
                      )}
                    </Button>

                    {authError && (
                      <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-2xl animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Configuration Error
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed uppercase tracking-wider">
                          Domain <strong>{authError}</strong> is unauthorized. Please add it to your Firebase Console.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Privacy First</span>
                      <span className="text-[10px] font-bold text-slate-600">Encrypted Cloud</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Built For</span>
                      <span className="text-[10px] font-bold text-slate-600">High Performers</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-500/10 rounded-full blur-[80px] -z-10" />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 pb-12 overflow-x-hidden animate-in fade-in duration-700">
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 w-full">
          <Card className="p-8 md:p-12 shadow-2xl shadow-primary/5 bg-card border-border rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-10 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">{format(currentMonth, "MMMM yyyy")}</h2>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-12 w-12 bg-card shadow-sm rounded-xl"><ChevronLeft className="w-6 h-6" /></Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-12 w-12 bg-card shadow-sm rounded-xl"><ChevronRight className="w-6 h-6" /></Button>
              </div>
            </div>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (<div key={day} className="text-center text-xs font-black text-muted-foreground/40 py-4 uppercase tracking-[0.25em]">{day}</div>))}
              {days.map((day) => (<CalendarCell key={day.toISOString()} date={day} currentMonth={currentMonth} isSelected={isSameDay(day, selectedDate)} tasks={tasks} onClick={() => setSelectedDate(day)} />))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 w-full lg:sticky lg:top-8">
          <Card className={cn("p-8 md:p-10 shadow-2xl transition-all duration-500 flex flex-col bg-card border-border rounded-[2.5rem] overflow-hidden min-h-[700px]", goalMet ? "shadow-accent/10 border-accent/20 ring-1 ring-accent/10" : "shadow-primary/5")}>
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-5">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-muted/20" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" strokeDasharray={176} strokeDashoffset={176 - (176 * completionRate) / 100} className={cn("transition-all duration-1000 ease-in-out", goalMet ? "text-accent" : "text-primary")} />
                  </svg>
                  <span className={cn("absolute text-xs font-black", goalMet ? "text-accent" : "text-primary")}>{goalMet ? <Star className="w-4 h-4 fill-current" /> : `${Math.round(completionRate)}%`}</span>
                </div>
                <div className="flex flex-col text-primary">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-none">{format(selectedDate, "EEEE")}</h3>
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] mt-2">{format(selectedDate, "do MMMM")}</p>
                </div>
              </div>
              <Button onClick={() => { setEditingTask(null); setIsTaskDialogOpen(true); }} size="icon" className="rounded-[1.25rem] h-14 w-14 shadow-xl shadow-primary/20 shrink-0"><Plus className="w-8 h-8" /></Button>
            </div>

            <div className="space-y-6 mb-8 shrink-0">
              <div className={cn("flex items-center gap-4 p-4 rounded-[1.5rem] border transition-colors", goalMet ? "bg-accent/5 border-accent/20" : "bg-primary/5 border-primary/10")}>
                <div className={cn("p-3 rounded-xl shadow-sm transition-colors shrink-0", goalMet ? "bg-accent text-white" : "bg-background text-primary")}><Trophy className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", goalMet ? "text-accent" : "text-primary/60")}>Goal Progress</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black">{completedCount} / {dailyGoalValue || 0}</span>
                    <input type="number" min="0" max="20" value={dailyGoalValue} onChange={(e) => setDailyGoal(selectedDateStr, parseInt(e.target.value) || 0)} className="w-14 h-8 text-xs font-black text-center border-none bg-background shadow-sm rounded-xl outline-none" />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input placeholder="Search missions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 h-12 bg-muted/20 border-transparent rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <Button variant={activeLabelFilter === null ? "default" : "outline"} size="sm" onClick={() => setActiveLabelFilter(null)} className="h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl">All</Button>
                {labels.map(l => (<Button key={l.id} variant={activeLabelFilter === l.name ? "default" : "outline"} size="sm" onClick={() => setActiveLabelFilter(l.name === activeLabelFilter ? null : l.name)} className={cn("h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl", activeLabelFilter === l.name ? l.color : "hover:border-primary/30")}>{l.name}</Button>))}
              </div>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2 min-h-0">
              <div className="space-y-4 pb-6">
                {dailyTasks.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center gap-5 opacity-40">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">{searchQuery || activeLabelFilter ? <FilterX className="w-8 h-8" /> : <Target className="w-8 h-8" />}</div>
                    <p className="text-sm font-black uppercase tracking-widest">{searchQuery || activeLabelFilter ? "No matches found" : "No missions scheduled"}</p>
                  </div>
                ) : (
                  dailyTasks.map((task) => (<TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onEdit={(t) => { setEditingTask(t); setIsTaskDialogOpen(true); }} />))
                )}
              </div>
            </ScrollArea>

            <div className="mt-4 pt-6 border-t flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">{completedCount} / {dailyTasks.length} MISSIONS DONE</span>
              {dailyTasks.some(t => t.completed) && (<Button variant="ghost" size="sm" onClick={clearCompleted} className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-black h-9 px-4 rounded-xl text-[10px] uppercase tracking-widest"><Trash2 className="w-4 h-4 mr-2" />Clear Done</Button>)}
            </div>
          </Card>
        </div>
      </main>

      <TaskDialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen} onSubmit={handleTaskSubmit} initialTask={editingTask} defaultDate={selectedDateStr} />
    </div>
  );
}