"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { CalendarCell } from "@/components/calendar-cell";
import { SmartTaskInput } from "@/components/smart-task-input";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
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
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, CheckCircle2, BarChart2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Task } from "@/lib/types";

export default function DailyTaskTrack() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, isInitialized } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const dailyTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === selectedDateStr)
      .sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);
  }, [tasks, selectedDateStr]);

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

  const handleSmartParsed = (parsed: { description: string; dueDate?: string }) => {
    addTask({
      description: parsed.description,
      dueDate: parsed.dueDate || selectedDateStr,
      completed: false,
      label: "other",
    });
  };

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">DailyTaskTrack</h1>
            <p className="text-sm text-muted-foreground font-medium">Focused planning for a clearer day</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="flex-1">
            <SmartTaskInput onTaskParsed={handleSmartParsed} />
          </div>
          <Link href="/analytics">
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shadow-sm">
              <BarChart2 className="w-5 h-5 text-primary" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Section */}
        <Card className="lg:col-span-8 p-6 shadow-xl shadow-primary/5 bg-white/50 backdrop-blur-sm border-white/40">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="h-9 w-9">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="h-9 w-9">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="calendar-grid mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2 uppercase tracking-wider">
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

        {/* Sidebar / Daily List Section */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="p-6 shadow-xl shadow-primary/5 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-primary">{format(selectedDate, "EEEE")}</h3>
                <p className="text-sm text-muted-foreground">{format(selectedDate, "do MMMM, yyyy")}</p>
              </div>
              <Button 
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskDialogOpen(true);
                }} 
                size="icon" 
                className="rounded-full h-10 w-10 shadow-lg shadow-primary/30"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-3">
                {dailyTasks.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground/40">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">No tasks for this day yet.</p>
                    <Button variant="link" size="sm" onClick={() => setIsTaskDialogOpen(true)}>
                      Add your first task
                    </Button>
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
              <div className="mt-6 pt-6 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-muted-foreground">
                    {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length} Completed
                  </span>
                </div>
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-500 ease-out"
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
      <Toaster />
    </div>
  );
}
