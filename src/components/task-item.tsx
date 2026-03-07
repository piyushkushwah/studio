"use client";

import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const { labels } = useTasks();
  
  // Find the label object to get the current color
  const labelObj = labels.find(l => l.name.toLowerCase() === task.label?.toLowerCase());
  const labelColor = labelObj?.color || "bg-slate-500 text-white hover:bg-slate-600";

  return (
    <div className={cn(
      "group flex items-center gap-4 p-4 rounded-xl border bg-white transition-all hover:shadow-md hover:border-primary/20",
      task.completed && "bg-white/40 border-accent/20 opacity-80"
    )}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="h-6 w-6 border-2 data-[state=checked]:bg-accent data-[state=checked]:border-accent transition-colors"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-1">
          <p className={cn(
            "text-base font-semibold transition-all break-words",
            task.completed ? "text-muted-foreground line-through" : "text-primary"
          )}>
            {task.description}
          </p>
          {task.label && (
            <div className="flex">
              <Badge variant="secondary" className={cn("text-[10px] h-5 px-2 uppercase font-bold tracking-wider shadow-sm", labelColor)}>
                {task.label}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full"
          onClick={() => onEdit(task)}
          title="Edit Task"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full"
          onClick={() => onDelete(task.id)}
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
