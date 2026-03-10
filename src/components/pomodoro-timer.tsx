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
import { useTasks } from "@/hooks/use-tasks";

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
  const { addSession } = useTasks();

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
      
      // Log the completed session
      addSession(Math.floor(MODE_CONFIG[mode].seconds / 60), mode);

      const nextMode = mode === "work" ? "short" : "work";
      
      toast({
        title: mode === "work" ? "Focus session complete!" : "Break finished!",
        description: mode === "work" ? "Take 5 minutes to recharge." : "Ready for another round?",
      });

      switchMode(nextMode);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, toast, switchMode, addSession]);

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
    <div className="relative flex items-center gap-3 bg-white border shadow-sm rounded-2xl px-4 h-12 transition-all hover:border-primary/30 group">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => switchMode(mode === "work" ? "short" : "work")}
        className={cn(
          "h-8 w-8 rounded-xl shrink-0 transition-colors",
          mode === "work" ? "text-primary bg-primary/5" : "text-accent bg-accent/5"
        )}
      >
        {mode === "work" ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
      </Button>

      <div className="flex flex-col min-w-[50px]">
        <span className="text-sm font-black tabular-nums tracking-tighter leading-none">
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="flex items-center gap-1 border-l pl-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTimer}
          className={cn(
            "h-8 w-8 rounded-xl transition-all",
            isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={resetTimer}
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-muted/30 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000 ease-linear", MODE_CONFIG[mode].accent)} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
