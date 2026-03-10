"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil, AlertCircle, Flag, ChevronDown, ChevronUp, AlignLeft } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Find the label object to get the current color
  const labelObj = labels.find(l => l.name.toLowerCase() === task.label?.toLowerCase());
  const labelColor = labelObj?.color || "bg-slate-500 text-white hover:bg-slate-600";

  const priorityConfig = {
    low: { icon: null, class: "text-muted-foreground/60" },
    medium: { icon: Flag, class: "text-blue-500" },
    high: { icon: AlertCircle, class: "text-destructive" },
  };

  const PriorityIcon = task.priority ? priorityConfig[task.priority].icon : null;

  const handleToggle = () => {
    onToggle(task.id);
  };

  return (
    <div className={cn(
      "group flex flex-col p-3 md:p-4 rounded-xl border bg-white transition-all hover:shadow-md hover:border-primary/20",
      task.completed && "bg-white/40 border-accent/20 opacity-80",
      !task.completed && task.priority === 'high' && "border-destructive/30 shadow-sm shadow-destructive/5",
      task.completed && "animate-completion"
    )}>
      <div className="flex items-start sm:items-center gap-3 md:gap-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          className="h-5 w-5 md:h-6 md:w-6 border-2 data-[state=checked]:bg-accent data-[state=checked]:border-accent transition-colors shrink-0 mt-0.5 sm:mt-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              {PriorityIcon && !task.completed && (
                <PriorityIcon className={cn("w-4 h-4 shrink-0", priorityConfig[task.priority!].class)} />
              )}
              <p className={cn(
                "text-sm md:text-base font-semibold transition-all break-words leading-tight",
                task.completed ? "text-muted-foreground line-through" : "text-primary",
                !task.completed && task.priority === 'high' && "text-destructive"
              )}>
                {task.description}
              </p>
              {task.notes && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                >
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              )}
            </div>
            {task.label && (
              <div className="flex">
                <Badge variant="secondary" className={cn("text-[8px] md:text-[10px] h-4 md:h-5 px-1.5 md:px-2 uppercase font-bold tracking-wider shadow-sm", labelColor)}>
                  {task.label}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 md:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full"
            onClick={() => onEdit(task)}
            title="Edit Task"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full"
            onClick={() => onDelete(task.id)}
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isExpanded && task.notes && (
        <div className="mt-3 pl-8 md:pl-10 text-xs md:text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg border-l-2 border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <AlignLeft className="w-3 h-3" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Notes</span>
          </div>
          <p className="whitespace-pre-wrap">{task.notes}</p>
        </div>
      )}
    </div>
  );
}
