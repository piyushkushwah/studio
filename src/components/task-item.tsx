"use client";

import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const LABEL_COLORS: Record<string, string> = {
  work: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  personal: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  shopping: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  urgent: "bg-red-100 text-red-700 hover:bg-red-100",
  other: "bg-gray-100 text-gray-700 hover:bg-gray-100",
};

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
        <div className="flex items-center gap-2 mb-1">
          <p className={cn(
            "text-sm font-medium transition-all truncate",
            task.completed ? "text-muted-foreground line-through" : "text-foreground"
          )}>
            {task.description}
          </p>
          {task.label && (
            <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 uppercase font-bold", LABEL_COLORS[task.label] || LABEL_COLORS.other)}>
              {task.label}
            </Badge>
          )}
        </div>
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
