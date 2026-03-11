"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { extractTaskDetails } from "@/ai/flows/smart-task-entry";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SmartTaskInputProps {
  onTaskParsed: (task: { description: string; dueDate?: string }) => void;
}

export function SmartTaskInput({ onTaskParsed }: SmartTaskInputProps) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleParse = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const taskInput = value.trim();
    
    if (taskInput.length < 3) return;

    setIsLoading(true);
    try {
      // Pass the client's local date to the AI for relative date resolution
      const currentDate = format(new Date(), "yyyy-MM-dd");
      
      const result = await extractTaskDetails({ 
        naturalLanguageTask: taskInput,
        currentDate 
      });
      
      if (result) {
        onTaskParsed({
          description: result.description,
          dueDate: result.dueDate || undefined,
        });
        setValue("");
        toast({
          title: "Task Added ✨",
          description: `"${result.description}" ${result.dueDate ? `scheduled for ${result.dueDate}` : 'added to your list'}.`,
        });
      }
    } catch (error: any) {
      console.error("SmartTaskInput Error:", error);
      
      let title = "AI Assistant Busy";
      let description = "We couldn't parse that automatically. Please try adding it manually.";
      
      if (error.message === 'QUOTA_EXCEEDED') {
        title = "AI Limit Reached";
        description = "The daily AI capacity for your current plan is exhausted. Please use manual entry.";
      } else if (error.message === 'INVALID_API_KEY' || error.message === 'MISSING_API_KEY') {
        title = "AI Not Configured";
        description = "The AI service is missing a valid API key. Please check your environment variables.";
      } else if (error.message === 'AI_PARSING_FAILED') {
        description = "The AI was confused by that request. Try being more specific like 'Buy milk tomorrow'.";
      }

      toast({
        variant: "destructive",
        title: title,
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleParse} className="relative group w-full">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors">
        <Sparkles className="w-4 h-4" />
      </div>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Smart add: 'Gym tomorrow' or 'Laundry next Mon'"
        className="pl-10 pr-12 bg-white border-primary/10 focus:border-primary/30 transition-all h-11 rounded-xl shadow-sm"
        disabled={isLoading}
      />
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          disabled={!value.trim() || isLoading || value.trim().length < 3}
          className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-30"
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
