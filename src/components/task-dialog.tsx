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
import { AlertCircle, Flag, AlignLeft, Sparkles, Loader2 } from "lucide-react";
import { breakdownTask } from "@/ai/flows/task-breakdown-flow";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState(defaultDate || format(new Date(), "yyyy-MM-dd"));
  const [label, setLabel] = useState<string>("other");
  const [priority, setPriority] = useState<Priority>("medium");
  const [isBreakingDown, setIsBreakingDown] = useState(false);

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

  const handleMagicBreakdown = async () => {
    if (!description.trim()) return;
    setIsBreakingDown(true);
    try {
      const result = await breakdownTask({ taskDescription: description });
      if (result.subtasks.length > 0) {
        const subtasksText = result.subtasks.map(s => `• ${s}`).join('\n');
        setNotes(prev => prev ? `${prev}\n\nSuggested Steps:\n${subtasksText}` : `Suggested Steps:\n${subtasksText}`);
        toast({ title: "Task Broken Down", description: "Added actionable steps to your notes." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "AI Busy", description: "Couldn't break down task right now." });
    } finally {
      setIsBreakingDown(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-primary">{initialTask ? "Edit Mission" : "New Mission"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <UILabel htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Core Objective</UILabel>
            <div className="relative">
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What needs to be done?"
                className="h-12 rounded-xl bg-muted/20 border-transparent focus:bg-white focus:border-primary/20 pr-10"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleMagicBreakdown}
                disabled={isBreakingDown || !description.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:bg-primary/10 rounded-lg"
                title="AI Magic Breakdown"
              >
                {isBreakingDown ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <UILabel htmlFor="notes" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
              <AlignLeft className="w-3 h-3" />
              Strategic Notes
            </UILabel>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details or steps..."
              className="resize-none h-32 rounded-xl bg-muted/20 border-transparent focus:bg-white focus:border-primary/20 p-4"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <UILabel htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Deadline</UILabel>
              <Input
                id="date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-12 rounded-xl bg-muted/20 border-transparent"
              />
            </div>
            <div className="space-y-2">
              <UILabel htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Severity</UILabel>
              <Select value={priority} onValueChange={(val) => setPriority(val as Priority)}>
                <SelectTrigger id="priority" className="h-12 rounded-xl bg-muted/20 border-transparent">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <UILabel htmlFor="label" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Category</UILabel>
            <Select value={label} onValueChange={setLabel}>
              <SelectTrigger id="label" className="h-12 rounded-xl bg-muted/20 border-transparent">
                <SelectValue placeholder="Select label" />
              </SelectTrigger>
              <SelectContent>
                {labels.map((l) => (
                  <SelectItem key={l.id} value={l.name}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4 flex gap-2">
            <Button type="button" variant="ghost" className="rounded-xl h-12 flex-1" onClick={() => onOpenChange(false)}>
              Discard
            </Button>
            <Button type="submit" disabled={!description.trim()} className="rounded-xl h-12 flex-1 shadow-xl shadow-primary/20">
              {initialTask ? "Update Mission" : "Confirm Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
