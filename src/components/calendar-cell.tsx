"use client";

import { cn } from "@/lib/utils";
import { Task } from "@/lib/types";
import { format, isToday, isSameMonth } from "date-fns";
import { CheckCircle2 } from "lucide-react";

interface CalendarCellProps {
  date: Date;
  currentMonth: Date;
  isSelected: boolean;
  tasks: Task[];
  onClick: () => void;
}

export function CalendarCell({
  date,
  currentMonth,
  isSelected,
  tasks,
  onClick,
}: CalendarCellProps) {
  const dayTasks = tasks.filter((t) => t.dueDate === format(date, "yyyy-MM-dd"));
  const completedTasks = dayTasks.filter((t) => t.completed);
  const total = dayTasks.length;
  const completed = completedTasks.length;

  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isTodayDate = isToday(date);

  return (
    <button
      onClick={onClick}
      className={cn(
        "calendar-cell relative p-2 flex flex-col items-start gap-1 transition-all border border-transparent hover:bg-white/50 group rounded-md",
        !isCurrentMonth && "opacity-30",
        isSelected && "bg-white shadow-sm ring-2 ring-primary border-primary",
        !isSelected && isTodayDate && "bg-primary/5 border-primary/20"
      )}
    >
      <span className={cn(
        "text-sm font-semibold",
        isTodayDate && "text-primary"
      )}>
        {format(date, "d")}
      </span>
      
      <div className="mt-auto w-full flex flex-wrap gap-0.5">
        {dayTasks.slice(0, 4).map((task) => (
          <div
            key={task.id}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              task.completed ? "bg-accent" : "bg-primary/40"
            )}
          />
        ))}
        {dayTasks.length > 4 && (
          <span className="text-[10px] text-muted-foreground">+{dayTasks.length - 4}</span>
        )}
      </div>

      {total > 0 && total === completed && (
        <CheckCircle2 className="absolute top-2 right-2 w-3.5 h-3.5 text-accent opacity-80" />
      )}
    </button>
  );
}