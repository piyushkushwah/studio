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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, Priority } from "@/lib/types";
import { format } from "date-fns";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { AlertCircle, Flag, AlignLeft } from "lucide-react";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: { description: string; notes?: string; dueDate: string; label?: string; priority?: Priority }) => void;
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
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState(defaultDate || format(new Date(), "yyyy-MM-dd"));
  const [label, setLabel] = useState<string>("other");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => {
    if (initialTask) {
      setDescription(initialTask.description);
      setNotes(initialTask.notes || "");
      setDueDate(initialTask.dueDate);
      setLabel(initialTask.label || "other");
      setPriority(initialTask.priority || "medium");
    } else {
      setDescription("");
      setNotes("");
      setLabel("other");
      setPriority("medium");
      if (defaultDate) setDueDate(defaultDate);
    }
  }, [initialTask, defaultDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !dueDate) return;
    onSubmit({ description, notes, dueDate, label, priority });
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

          <div className="space-y-2">
            <UILabel htmlFor="notes" className="flex items-center gap-2">
              <AlignLeft className="w-3.5 h-3.5" />
              Notes (Optional)
            </UILabel>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details, links, or sub-tasks..."
              className="resize-none h-24"
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
              <UILabel htmlFor="priority">Priority</UILabel>
              <Select value={priority} onValueChange={(val) => setPriority(val as Priority)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Flag className="w-3 h-3 text-slate-400" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Flag className="w-3 h-3 text-blue-500" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2 text-destructive font-semibold">
                      <AlertCircle className="w-3 h-3" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
