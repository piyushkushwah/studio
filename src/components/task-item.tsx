"use client";

import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  return (
    <div className={cn(
      "group flex items-center gap-3 p-3 rounded-lg border bg-white transition-all hover:shadow-sm",
      task.completed && "bg-white/40 border-accent/20"
    )}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="h-5 w-5 border-2 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
      />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium transition-all truncate",
          task.completed ? "text-muted-foreground line-through" : "text-foreground"
        )}>
          {task.description}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => onEdit(task)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}