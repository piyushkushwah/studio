"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { extractTaskDetails } from "@/ai/flows/smart-task-entry";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
      const currentDate = format(new Date(), "yyyy-MM-dd");
      const result = await extractTaskDetails({ 
        naturalLanguageTask: value,
        currentDate 
      });
      
      if (result) {
        onTaskParsed({
          description: result.description,
          dueDate: result.dueDate || undefined,
        });
        setValue("");
        toast({
          title: "Task Added",
          description: `"${result.description}" ${result.dueDate ? `scheduled for ${result.dueDate}` : ""}`,
        });
      }
    } catch (error: any) {
      console.error("SmartTaskInput Error:", error);
      
      let errorMessage = "Something went wrong while parsing the task.";
      
      if (error.message === 'API_KEY_MISSING') {
        errorMessage = "Gemini API key is not configured. Please add GOOGLE_GENAI_API_KEY to your environment variables.";
      } else if (error.message.includes('safety')) {
        errorMessage = "The AI flagged this input as unsafe. Please try rephrasing.";
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
        className="pl-10 pr-12 bg-white/80 border-primary/20 focus:bg-white transition-all h-11 rounded-xl shadow-sm"
        disabled={isLoading}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2">
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          disabled={!value.trim() || isLoading}
          className="h-9 w-9 text-primary hover:bg-primary/10 rounded-lg"
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
