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
    
    if (taskInput.length < 3) {
      toast({
        variant: "destructive",
        title: "Input too short",
        description: "Please enter at least 3 characters.",
      });
      return;
    }

    setIsLoading(true);
    try {
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
          title: "Task Parsed",
          description: `Added "${result.description}" for ${result.dueDate || 'today'}.`,
        });
      }
    } catch (error: any) {
      console.error("SmartTaskInput Error:", error);
      
      let errorMessage = "AI was unable to parse this task. Please try again or add manually.";
      
      if (error.message === 'API_KEY_MISSING') {
        errorMessage = "Gemini API key is missing. Please check your environment variables.";
      } else if (error.message === 'API_KEY_INVALID') {
        errorMessage = "Invalid Gemini API key. Please check your Google AI Studio settings.";
      } else if (error.message === 'SAFETY_BLOCKED') {
        errorMessage = "The content was flagged by safety filters. Please rephrase your task.";
      } else if (error.message === 'AI_EMPTY_RESPONSE') {
        errorMessage = "The AI returned an empty response. Please try a different phrasing.";
      }

      toast({
        variant: "destructive",
        title: "AI Parsing Failed",
        description: errorMessage,
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
        placeholder="Try 'Doctor appointment tomorrow at 10am'..."
        className="pl-10 pr-12 bg-white border-primary/10 focus:border-primary/30 transition-all h-11 rounded-xl shadow-sm"
        disabled={isLoading}
      />
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          disabled={!value.trim() || isLoading}
          className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg"
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
