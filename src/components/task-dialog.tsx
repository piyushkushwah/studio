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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task } from "@/lib/types";
import { format } from "date-fns";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: { description: string; dueDate: string; label?: string }) => void;
  initialTask?: Task | null;
  defaultDate?: string;
}

const LABELS = [
  { value: "work", label: "Work" },
  { value: "personal", label: "Personal" },
  { value: "shopping", label: "Shopping" },
  { value: "urgent", label: "Urgent" },
  { value: "other", label: "Other" },
];

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  initialTask,
  defaultDate,
}: TaskDialogProps) {
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
            <Label htmlFor="description">Task Description</Label>
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
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Select value={label} onValueChange={setLabel}>
                <SelectTrigger id="label">
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  {LABELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
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
