
"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { CalendarCell } from "@/components/calendar-cell";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { LabelManager } from "@/components/label-manager";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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
  Calendar as CalendarIcon, 
  CheckCircle2, 
  BarChart2,
  Search,
  FilterX
} from "lucide-react";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DailyTaskTrack() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, labels, isInitialized } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelFilter, setActiveLabelFilter] = useState<string | null>(null);

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

    return filtered.sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);
  }, [tasks, selectedDateStr, searchQuery, activeLabelFilter]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleTaskSubmit = (taskData: { description: string; dueDate: string; label?: string }) => {
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

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/20 shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-primary">DailyTaskTrack</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Focused planning for a clearer day</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LabelManager />
          <Link href="/analytics" className="shrink-0">
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shadow-sm hover:bg-white transition-colors">
              <BarChart2 className="w-5 h-5 text-primary" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Section */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full overflow-hidden">
          <Card className="p-4 md:p-8 shadow-xl shadow-primary/5 bg-white border-white/40">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-primary">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth} className="h-9 w-9 bg-white/50">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} className="h-9 w-9 bg-white/50">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-[10px] md:text-xs font-bold text-muted-foreground/60 py-2 uppercase tracking-widest">
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
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          <PomodoroTimer />

          <Card className="p-6 md:p-8 shadow-xl shadow-primary/5 min-h-[400px] md:min-h-[450px] flex flex-col bg-white border-white/40">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-primary">{format(selectedDate, "EEEE")}</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">{format(selectedDate, "do MMMM, yyyy")}</p>
              </div>
              <Button 
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskDialogOpen(true);
                }} 
                size="icon" 
                className="rounded-full h-11 w-11 md:h-12 md:w-12 shadow-lg shadow-primary/20 transition-transform active:scale-95 shrink-0"
              >
                <Plus className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-8">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search daily tasks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                />
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                <Button 
                  variant={activeLabelFilter === null ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setActiveLabelFilter(null)}
                  className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg"
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
                      "h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
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
                  <div className="py-12 md:py-16 text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/30">
                      {searchQuery || activeLabelFilter ? <FilterX className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold">
                        {searchQuery || activeLabelFilter ? "No matching tasks found." : "No tasks for this day yet."}
                      </p>
                      {!searchQuery && !activeLabelFilter && (
                        <Button variant="link" size="sm" onClick={() => setIsTaskDialogOpen(true)} className="mt-1">
                          Create your first task
                        </Button>
                      )}
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
              <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-bold text-primary">
                    {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length} Done
                  </span>
                </div>
                <div className="w-full sm:w-32 h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-accent transition-all duration-700 ease-in-out"
                    style={{ 
                      width: `${(dailyTasks.filter(t => t.completed).length / dailyTasks.length) * 100}%` 
                    }}
                  />
                </div>
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
