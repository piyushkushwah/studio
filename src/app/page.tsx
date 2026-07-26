
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { CalendarCell } from "@/components/calendar-cell";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { LabelManager } from "@/components/label-manager";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { FocusPlayer } from "@/components/focus-player";
import { AppTour } from "@/components/app-tour";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  CheckCircle2, 
  BarChart2,
  Search,
  FilterX,
  Target,
  Trash2,
  Clock,
  Quote,
  HelpCircle,
  Trophy,
  Flame,
  Star
} from "lucide-react";
import { Task, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getRandomQuote } from "@/lib/quotes";
import { useToast } from "@/hooks/use-toast";

export default function DailyTaskTrack() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, labels, isInitialized, dailyGoals, setDailyGoal, streak } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Hello");
  const [quote, setQuote] = useState<string | null>(null);
  const { toast } = useToast();

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
    if (goalMet && isInitialized) {
      const lastCelebrated = localStorage.getItem(`celebrated_${selectedDateStr}`);
      if (!lastCelebrated) {
        toast({ title: "Goal Reached! 🎉", description: `You've completed your goal of ${dailyGoalValue} tasks for today.` });
        localStorage.setItem(`celebrated_${selectedDateStr}`, "true");
      }
    }
  }, [goalMet, selectedDateStr, dailyGoalValue, toast, isInitialized]);

  const handleTaskSubmit = (taskData: { description: string; notes?: string; dueDate: string; label?: string; priority?: Priority }) => {
    if (editingTask) updateTask(editingTask.id, taskData);
    else addTask({ ...taskData, completed: false });
    setEditingTask(null);
  };

  const clearCompleted = () => {
    dailyTasks.filter(t => t.completed).forEach(t => deleteTask(t.id));
  };

  const completionRate = dailyTasks.length > 0 ? (completedCount / dailyTasks.length) * 100 : 0;

  if (!isInitialized) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-32 h-4" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      <AppTour />
      
      <header id="tour-header" className="w-full max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12 shrink-0">
        <div className="flex items-center gap-5">
          <div className="bg-primary text-white p-3 rounded-2xl shadow-xl shadow-primary/20 shrink-0">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary leading-tight">{greeting}</h1>
              {streak > 0 && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold border border-orange-200 shrink-0">
                  <Flame className="w-3 h-3 fill-current" />
                  {streak} Day Streak
                </div>
              )}
            </div>
            <div className="flex items-start gap-2 mt-1 max-w-md h-8">
              <Quote className="w-3 h-3 text-accent mt-1 shrink-0" />
              {quote ? <p className="text-xs italic text-muted-foreground font-medium line-clamp-2">{quote}</p> : <div className="space-y-1.5 py-1 w-full"><Skeleton className="h-2 w-full max-w-[280px]" /><Skeleton className="h-2 w-[180px]" /></div>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FocusPlayer />
          <PomodoroTimer />
          <div id="tour-nav" className="flex items-center gap-1 h-12 bg-white border px-2 rounded-2xl shadow-sm">
            <LabelManager />
            <Link href="/time-tracking">
              <Button variant="ghost" className="flex flex-col items-center justify-center gap-0.5 h-auto py-1 px-3 rounded-xl hover:bg-primary/5 group" title="Time Tracking">
                <Clock className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                <span className="text-[8px] font-black uppercase tracking-tighter text-primary/60">Log</span>
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" className="flex flex-col items-center justify-center gap-0.5 h-auto py-1 px-3 rounded-xl hover:bg-primary/5 group" title="Analytics">
                <BarChart2 className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                <span className="text-[8px] font-black uppercase tracking-tighter text-primary/60">Stats</span>
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => (window as any).restartAppTour?.()} className="flex flex-col items-center justify-center gap-0.5 h-auto py-1 px-3 rounded-xl hover:bg-primary/5 group" title="App Tour">
              <HelpCircle className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
              <span className="text-[8px] font-black uppercase tracking-tighter text-primary/60">Help</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-start flex-1 min-h-0">
        <div id="tour-calendar" className="lg:col-span-7 flex flex-col gap-8 w-full">
          <Card className="p-6 md:p-10 shadow-2xl shadow-primary/5 bg-white border-white/50 rounded-[2rem]">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight">{format(currentMonth, "MMMM yyyy")}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-10 w-10 bg-white shadow-sm rounded-xl"><ChevronLeft className="w-5 h-5" /></Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-10 w-10 bg-white shadow-sm rounded-xl"><ChevronRight className="w-5 h-5" /></Button>
              </div>
            </div>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (<div key={day} className="text-center text-[11px] font-black text-muted-foreground/50 py-3 uppercase tracking-[0.2em]">{day}</div>))}
              {days.map((day) => (<CalendarCell key={day.toISOString()} date={day} currentMonth={currentMonth} isSelected={isSameDay(day, selectedDate)} tasks={tasks} onClick={() => setSelectedDate(day)} />))}
            </div>
          </Card>
        </div>

        <div id="tour-tasks" className="lg:col-span-5 flex flex-col w-full lg:sticky lg:top-8 h-full lg:h-[calc(100vh-12rem)]">
          <Card className={cn("p-6 md:p-8 shadow-2xl transition-all duration-500 h-full flex flex-col bg-white border-white/50 rounded-[2rem] overflow-hidden", goalMet ? "shadow-accent/10 border-accent/20 ring-1 ring-accent/10" : "shadow-primary/5")}>
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
              <Button id="tour-add-task" onClick={() => { setEditingTask(null); setIsTaskDialogOpen(true); }} size="icon" className="rounded-2xl h-12 w-12 shadow-xl shadow-primary/20 shrink-0"><Plus className="w-6 h-6" /></Button>
            </div>

            <div className="space-y-4 mb-6 shrink-0">
              <div className={cn("flex items-center gap-3 p-3 rounded-2xl border transition-colors", goalMet ? "bg-accent/5 border-accent/20" : "bg-primary/5 border-primary/10")}>
                <div className={cn("p-2 rounded-lg shadow-sm transition-colors shrink-0", goalMet ? "bg-accent text-white" : "bg-white text-primary")}><Trophy className="w-3.5 h-3.5" /></div>
                <div className="flex-1">
                  <p className={cn("text-[9px] font-black uppercase tracking-widest", goalMet ? "text-accent" : "text-primary/60")}>Goal</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{completedCount} / {dailyGoalValue || 0}</span>
                    <Input type="number" min="0" max="20" value={dailyGoalValue} onChange={(e) => setDailyGoal(selectedDateStr, parseInt(e.target.value) || 0)} className="w-12 h-6 text-[10px] font-bold text-center border-none bg-white shadow-sm rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="relative group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary" /><Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 bg-muted/20 border-transparent rounded-xl text-xs" /></div>
              <div className="flex flex-wrap gap-1.5">
                <Button variant={activeLabelFilter === null ? "default" : "outline"} size="sm" onClick={() => setActiveLabelFilter(null)} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg">All</Button>
                {labels.map(l => (<Button key={l.id} variant={activeLabelFilter === l.name ? "default" : "outline"} size="sm" onClick={() => setActiveLabelFilter(l.name === activeLabelFilter ? null : l.name)} className={cn("h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg", activeLabelFilter === l.name ? l.color : "hover:border-primary/30")}>{l.name}</Button>))}
              </div>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2 overflow-y-auto">
              <div className="space-y-3 pb-4">
                {dailyTasks.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground/20">{searchQuery || activeLabelFilter ? <FilterX className="w-6 h-6" /> : <Target className="w-6 h-6" />}</div>
                    <p className="text-xs text-muted-foreground font-bold">{searchQuery || activeLabelFilter ? "No matches." : "No tasks."}</p>
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
