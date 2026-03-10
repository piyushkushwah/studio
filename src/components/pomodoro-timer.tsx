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
    label: "Focus Session",
    seconds: 25 * 60,
    color: "text-primary",
    bgColor: "bg-primary/10",
    accent: "bg-primary",
  },
  short: {
    label: "Short Break",
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
    <div className="relative flex items-center gap-3 bg-white border shadow-md rounded-2xl px-4 h-14 transition-all hover:border-primary/30 group">
      {/* Mode Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => switchMode(mode === "work" ? "short" : "work")}
        className={cn(
          "h-10 w-10 rounded-xl shrink-0 transition-colors",
          mode === "work" ? "text-primary bg-primary/5 hover:bg-primary/10" : "text-accent bg-accent/5 hover:bg-accent/10"
        )}
        title={`Switch to ${mode === "work" ? "Break" : "Focus"}`}
      >
        {mode === "work" ? <Brain className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
      </Button>

      {/* Timer Display */}
      <div className="flex flex-col min-w-[70px]">
        <span className="text-lg font-black tabular-nums tracking-tighter leading-none">
          {formatTime(timeLeft)}
        </span>
        <span className={cn("text-[10px] font-bold uppercase tracking-widest leading-none mt-1", MODE_CONFIG[mode].color)}>
          {mode === "work" ? "Focus" : "Break"}
        </span>
      </div>

      <div className="flex items-center gap-1 border-l pl-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTimer}
          className={cn(
            "h-10 w-10 rounded-xl transition-all",
            isActive ? "text-primary bg-primary/5 scale-95" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
          )}
        >
          {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={resetTimer}
          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress bar at the bottom */}
      <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-muted/30 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000 ease-linear", MODE_CONFIG[mode].accent)} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
