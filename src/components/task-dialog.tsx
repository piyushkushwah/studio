"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task } from "@/lib/types";
import { format } from "date-fns";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: { description: string; dueDate: string; label?: string }) => void;
  initialTask?: Task | null;
  defaultDate?: string;
}

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  initialTask,
  defaultDate,
}: TaskDialogProps) {
  const { labels } = useTasks();
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(defaultDate || format(new Date(), "yyyy-MM-dd"));
  const [label, setLabel] = useState<string>("other");

  useEffect(() => {
    if (initialTask) {
      setDescription(initialTask.description);
      setDueDate(initialTask.dueDate);
      setLabel(initialTask.label || "other");
    } else {
      setDescription("");
      setLabel("other");
      if (defaultDate) setDueDate(defaultDate);
    }
  }, [initialTask, defaultDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !dueDate) return;
    onSubmit({ description, dueDate, label });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialTask ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <UILabel htmlFor="description">Task Description</UILabel>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <UILabel htmlFor="date">Date</UILabel>
              <Input
                id="date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <UILabel htmlFor="label">Label</UILabel>
              <Select value={label} onValueChange={setLabel}>
                <SelectTrigger id="label">
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  {labels.map((l) => (
                    <SelectItem key={l.id} value={l.name}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", l.color.split(' ')[0])} />
                        {l.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!description.trim()}>
              {initialTask ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
