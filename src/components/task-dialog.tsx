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
import { Label } from "@/components/ui/label";
import { Task } from "@/lib/types";
import { format } from "date-fns";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: { description: string; dueDate: string }) => void;
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
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(defaultDate || format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    if (initialTask) {
      setDescription(initialTask.description);
      setDueDate(initialTask.dueDate);
    } else {
      setDescription("");
      if (defaultDate) setDueDate(defaultDate);
    }
  }, [initialTask, defaultDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !dueDate) return;
    onSubmit({ description, dueDate });
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
            <Label htmlFor="description">Task Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
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