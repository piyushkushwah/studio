"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type TimerMode = "work" | "short";

const MODE_CONFIG = {
  work: {
    label: "Focus",
    seconds: 25 * 60,
    color: "text-primary",
    bgColor: "bg-primary/10",
    accent: "bg-primary",
  },
  short: {
    label: "Break",
    seconds: 5 * 60,
    color: "text-accent",
    bgColor: "bg-accent/10",
    accent: "bg-accent",
  },
};

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.work.seconds);
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].seconds);
    setIsActive(false);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const nextMode = mode === "work" ? "short" : "work";
      
      toast({
        title: mode === "work" ? "Focus session complete!" : "Break finished!",
        description: mode === "work" ? "Take 5 minutes to recharge." : "Ready for another round?",
      });

      switchMode(nextMode);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, toast, switchMode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODE_CONFIG[mode].seconds);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((MODE_CONFIG[mode].seconds - timeLeft) / MODE_CONFIG[mode].seconds) * 100;

  return (
    <div className="relative flex items-center gap-1 bg-white border shadow-sm rounded-xl px-2 h-11 transition-all hover:border-primary/20 group">
      {/* Mode Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => switchMode(mode === "work" ? "short" : "work")}
        className={cn(
          "h-8 w-8 rounded-lg shrink-0",
          mode === "work" ? "text-primary hover:bg-primary/5" : "text-accent hover:bg-accent/5"
        )}
        title={`Switch to ${mode === "work" ? "Break" : "Focus"}`}
      >
        {mode === "work" ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
      </Button>

      {/* Timer Display */}
      <div className="flex flex-col px-1 min-w-[48px]">
        <span className="text-xs font-black tabular-nums tracking-tight leading-none">
          {formatTime(timeLeft)}
        </span>
        <span className={cn("text-[8px] font-bold uppercase tracking-widest leading-none mt-1", MODE_CONFIG[mode].color)}>
          {MODE_CONFIG[mode].label}
        </span>
      </div>

      <div className="flex items-center gap-0.5 border-l pl-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTimer}
          className={cn(
            "h-8 w-8 rounded-lg",
            isActive ? "text-primary animate-pulse" : "text-muted-foreground hover:text-primary"
          )}
        >
          {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={resetTimer}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Tiny progress bar at the very bottom */}
      <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000", MODE_CONFIG[mode].accent)} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
