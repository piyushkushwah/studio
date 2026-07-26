
"use client";

import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";

const MODE_CONFIG = {
  work: {
    label: "Focus Session",
    seconds: 25 * 60,
    accent: "bg-primary",
  },
  short: {
    label: "Short Break",
    seconds: 5 * 60,
    accent: "bg-accent",
  },
};

export function PomodoroTimer() {
  const { 
    timerLeft, 
    timerMode, 
    isTimerActive, 
    setTimerActive, 
    setTimerMode, 
    resetTimer 
  } = useTasks();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((MODE_CONFIG[timerMode].seconds - timerLeft) / MODE_CONFIG[timerMode].seconds) * 100;

  return (
    <div id="tour-timer" className="relative flex items-center gap-3 bg-white border shadow-sm rounded-2xl px-4 h-12 transition-all hover:border-primary/30 group">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTimerMode(timerMode === "work" ? "short" : "work")}
        className={cn(
          "h-8 w-8 rounded-xl shrink-0 transition-colors",
          timerMode === "work" ? "text-primary bg-primary/5" : "text-accent bg-accent/5"
        )}
      >
        {timerMode === "work" ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
      </Button>

      <div className="flex flex-col min-w-[50px]">
        <span className="text-sm font-black tabular-nums tracking-tighter leading-none">
          {formatTime(timerLeft)}
        </span>
      </div>

      <div className="flex items-center gap-1 border-l pl-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTimerActive(!isTimerActive)}
          className={cn(
            "h-8 w-8 rounded-xl transition-all",
            isTimerActive ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          {isTimerActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
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
          className={cn("h-full transition-all duration-1000 ease-linear", MODE_CONFIG[timerMode].accent)} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
