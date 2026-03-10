"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Timer as TimerIcon,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type TimerMode = "work" | "short" | "long";

const MODE_CONFIG = {
  work: {
    label: "Focus",
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
  long: {
    label: "Long Break",
    seconds: 15 * 60,
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    accent: "bg-blue-600",
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
        title: mode === "work" ? "Time's up!" : "Break over!",
        description: mode === "work" ? "Time for a well-deserved break." : "Ready to focus again?",
        action: (
          <Button variant="outline" size="sm" onClick={() => switchMode(nextMode)}>
            Switch to {MODE_CONFIG[nextMode].label}
          </Button>
        ),
      });

      // Simple notification sound (optional)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(mode === "work" ? "Work session finished!" : "Break finished!");
      }
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
    <Card className="shadow-lg border-white/40 bg-white/60 backdrop-blur-md overflow-hidden animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TimerIcon className={cn("w-5 h-5", MODE_CONFIG[mode].color)} />
            <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
              Pomodoro
            </span>
          </div>
          <div className="flex bg-muted/50 p-1 rounded-lg gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => switchMode("work")}
              className={cn(
                "h-8 px-3 rounded-md text-xs font-bold transition-all",
                mode === "work" ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
              )}
            >
              <Brain className="w-3.5 h-3.5 mr-1" />
              Focus
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => switchMode("short")}
              className={cn(
                "h-8 px-3 rounded-md text-xs font-bold transition-all",
                mode === "short" ? "bg-white shadow-sm text-accent" : "text-muted-foreground"
              )}
            >
              <Coffee className="w-3.5 h-3.5 mr-1" />
              Break
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <div className="text-5xl font-black tabular-nums tracking-tighter text-primary drop-shadow-sm">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="w-full space-y-2">
            <Progress 
              value={progress} 
              className="h-2.5 bg-muted"
              // Custom indicator color mapping
              style={{ 
                // @ts-ignore
                "--progress-background": mode === 'work' ? 'hsl(var(--primary))' : mode === 'short' ? 'hsl(var(--accent))' : 'rgb(37, 99, 235)'
              }}
            />
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>{MODE_CONFIG[mode].label}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            <Button
              onClick={toggleTimer}
              className={cn(
                "flex-1 h-12 rounded-xl text-lg font-bold shadow-md transition-all active:scale-95",
                isActive ? "bg-white text-primary border-2 border-primary hover:bg-primary/5" : MODE_CONFIG[mode].accent
              )}
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5 mr-2 fill-current" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Focus
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="h-12 w-12 rounded-xl shadow-sm hover:bg-white"
            >
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
