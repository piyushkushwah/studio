"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
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
      // Pass the local client date to ensure relative dates are resolved correctly for the user's timezone
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
          title: "Task Extracted",
          description: `"${result.description}" ${result.dueDate ? `set for ${result.dueDate}` : 'added to today'}.`,
        });
      }
    } catch (error: any) {
      console.error("SmartTaskInput Error:", error);
      
      let title = "AI Parsing Failed";
      let description = "We couldn't process that task. Try being more specific or add it manually.";
      
      if (error.message === 'QUOTA_EXCEEDED') {
        title = "Daily Limit Reached";
        description = "Your Gemini AI free tier quota is exhausted. Please try again later or use manual entry.";
      } else if (error.message === 'INVALID_API_KEY' || error.message === 'MISSING_API_KEY') {
        title = "Configuration Error";
        description = "The AI service is not properly configured. Check your API key.";
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
        placeholder="Smart add: 'Doctor appointment next Friday'..."
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
