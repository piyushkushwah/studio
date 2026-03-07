"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { extractTaskDetails } from "@/ai/flows/smart-task-entry";
import { toast } from "@/hooks/use-toast";

interface SmartTaskInputProps {
  onTaskParsed: (task: { description: string; dueDate?: string }) => void;
}

export function SmartTaskInput({ onTaskParsed }: SmartTaskInputProps) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleParse = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim()) return;

    setIsLoading(true);
    try {
      const result = await extractTaskDetails({ naturalLanguageTask: value });
      if (result) {
        onTaskParsed({
          description: result.description,
          dueDate: result.dueDate || undefined,
        });
        setValue("");
        toast({
          title: "AI Analysis Complete",
          description: "Task details extracted successfully.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Parsing Failed",
        description: "Could not parse task details. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleParse} className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors">
        <Sparkles className="w-4 h-4" />
      </div>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a task (e.g., 'Team meeting on Friday')"
        className="pl-10 pr-12 bg-white/80 border-primary/20 focus:bg-white transition-all h-11"
        disabled={isLoading}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2">
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          disabled={!value.trim() || isLoading}
          className="h-9 w-9 text-primary hover:bg-primary/10"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </Button>
      </div>
    </form>
  );
}