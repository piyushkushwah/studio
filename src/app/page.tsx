"use client";

import { useState, useMemo, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { CalendarCell } from "@/components/calendar-cell";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { LabelManager } from "@/components/label-manager";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { AppTour } from "@/components/app-tour";
import { SmartTaskInput } from "@/components/smart-task-input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Trophy
} from "lucide-react";
import { Task, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getDailyQuote } from "@/lib/quotes";

export default function DailyTaskTrack() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, labels, isInitialized, dailyGoals, setDailyGoal } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Hello");
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const hour = getHours(new Date());
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    
    setQuote(getDailyQuote());
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  
  const dailyTasks = useMemo(() => {
    let filtered = tasks.filter((t) => t.dueDate === selectedDateStr);
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
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

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleTaskSubmit = (taskData: { description: string; notes?: string; dueDate: string; label?: string; priority?: Priority }) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask({
        ...taskData,
        completed: false,
      });
    }
    setEditingTask(null);
  };

  const handleSmartTaskParsed = (parsedTask: { description: string; dueDate?: string }) => {
    addTask({
      description: parsedTask.description,
      dueDate: parsedTask.dueDate || selectedDateStr,
      completed: false,
      priority: 'medium',
      label: 'other'
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const clearCompleted = () => {
    dailyTasks.filter(t => t.completed).forEach(t => deleteTask(t.id));
  };

  const completionRate = dailyTasks.length > 0 
    ? (completedCount / dailyTasks.length) * 100 
    : 0;

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <AppTour />
      
      <header id="tour-header" className="w-full max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
        <div className="flex items-center gap-5">
          <div className="bg-primary text-white p-3 rounded-2xl shadow-xl shadow-primary/20 shrink-0">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary leading-tight">{greeting}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Quote className="w-3 h-3 text-accent" />
              <p className="text-xs italic text-muted-foreground font-medium">{quote}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PomodoroTimer />
          <div id="tour-nav" className="flex items-center gap-2 h-12 bg-white border px-3 rounded-2xl shadow-sm">
            <LabelManager />
            <Link href="/time-tracking">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 group" title="Time Tracking">
                <Clock className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 group" title="Analytics">
                <BarChart2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => (window as any).restartAppTour?.()}
              className="h-9 w-9 rounded-xl hover:bg-primary/5 group" 
              title="App Tour"
            >
              <HelpCircle className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Calendar Section */}
        <div id="tour-calendar" className="lg:col-span-7 flex flex-col gap-8 w-full">
          <Card className="p-6 md:p-10 shadow-2xl shadow-primary/5 bg-white border-white/50 rounded-[2rem]">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth} className="h-10 w-10 bg-white shadow-sm hover:border-primary/30 rounded-xl">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} className="h-10 w-10 bg-white shadow-sm hover:border-primary/30 rounded-xl">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-[11px] font-black text-muted-foreground/50 py-3 uppercase tracking-[0.2em]">
                  {day}
                </div>
              ))}
              {days.map((day) => (
                <CalendarCell
                  key={day.toISOString()}
                  date={day}
                  currentMonth={currentMonth}
                  isSelected={isSameDay(day, selectedDate)}
                  tasks={tasks}
                  onClick={() => setSelectedDate(day)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Section */}
        <div id="tour-tasks" className="lg:col-span-5 flex flex-col gap-8 w-full">
          <Card className="p-8 md:p-10 shadow-2xl shadow-primary/5 min-h-[500px] flex flex-col bg-white border-white/50 rounded-[2rem]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-muted/40"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={151}
                      strokeDashoffset={151 - (151 * completionRate) / 100}
                      className="text-accent transition-all duration-1000 ease-in-out"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-primary">{Math.round(completionRate)}%</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-black text-primary tracking-tight">{format(selectedDate, "EEEE")}</h3>
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{format(selectedDate, "do MMMM")}</p>
                </div>
              </div>
              <Button 
                id="tour-add-task"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskDialogOpen(true);
                }} 
                size="icon" 
                className="rounded-2xl h-14 w-14 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Plus className="w-7 h-7" />
              </Button>
            </div>

            {/* AI Smart Input */}
            <div className="mb-6">
              <SmartTaskInput onTaskParsed={handleSmartTaskParsed} />
            </div>

            {/* Daily Goal & Search */}
            <div className="space-y-5 mb-8">
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Daily Focus Goal</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{completedCount} / {dailyGoalValue || 0} tasks</span>
                    <Input 
                      type="number" 
                      min="0" 
                      max="20"
                      value={dailyGoalValue}
                      onChange={(e) => setDailyGoal(selectedDateStr, parseInt(e.target.value) || 0)}
                      className="w-16 h-8 text-xs font-bold text-center border-none bg-white shadow-sm rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Find a task..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-muted/20 border-transparent focus-visible:ring-2 focus-visible:ring-primary/10 rounded-xl"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={activeLabelFilter === null ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setActiveLabelFilter(null)}
                  className="h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl"
                >
                  All
                </Button>
                {labels.map(l => (
                  <Button
                    key={l.id}
                    variant={activeLabelFilter === l.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveLabelFilter(l.name === activeLabelFilter ? null : l.name)}
                    className={cn(
                      "h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm",
                      activeLabelFilter === l.name ? l.color : "hover:border-primary/30"
                    )}
                  >
                    {l.name}
                  </Button>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2 max-h-[400px]">
              <div className="space-y-4">
                {dailyTasks.length === 0 ? (
                  <div className="py-16 text-center flex flex-col items-center gap-5">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground/20">
                      {searchQuery || activeLabelFilter ? <FilterX className="w-8 h-8" /> : <Target className="w-8 h-8" />}
                    </div>
                    <div>
                      <p className="text-base text-muted-foreground font-bold">
                        {searchQuery || activeLabelFilter ? "No matches found." : "No tasks scheduled."}
                      </p>
                    </div>
                  </div>
                ) : (
                  dailyTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </ScrollArea>

            {dailyTasks.length > 0 && (
              <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm font-black text-primary tracking-tight">
                    {completedCount} OF {dailyTasks.length} COMPLETED
                  </span>
                </div>
                {dailyTasks.some(t => t.completed) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearCompleted}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold h-10 px-4 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Finished
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onSubmit={handleTaskSubmit}
        initialTask={editingTask}
        defaultDate={selectedDateStr}
      />
    </div>
  );
}
