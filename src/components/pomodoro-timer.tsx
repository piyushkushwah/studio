"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";

const TIMER_LIMITS = {
  work: 25 * 60,
  short: 5 * 60,
};

export function PomodoroTimer() {
  const { 
    workTimerLeft,
    breakTimerLeft,
    isWorkTimerActive,
    isBreakTimerActive,
    setWorkTimerActive,
    setBreakTimerActive,
    resetWorkTimer,
    resetBreakTimer
  } = useTasks();

  const [isPipAvailable, setIsPipAvailable] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setIsPipAvailable(
      typeof document !== 'undefined' && 
      'pictureInPictureEnabled' in document && 
      document.pictureInPictureEnabled
    );
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Canvas drawing for PiP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const activeTimer = isBreakTimerActive ? breakTimerLeft : workTimerLeft;
      const activeLabel = isBreakTimerActive ? "Short Break" : "Focus Session";
      const activeColor = isBreakTimerActive ? "#10b981" : "#1e40af";
      const totalSeconds = isBreakTimerActive ? TIMER_LIMITS.short : TIMER_LIMITS.work;
      
      const timeStr = formatTime(activeTimer);
      
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.arc(150, 150, 120, 0, Math.PI * 2);
      ctx.strokeStyle = "#f3f4f6";
      ctx.lineWidth = 20;
      ctx.stroke();

      const progress = (activeTimer / totalSeconds);
      ctx.beginPath();
      ctx.arc(150, 150, 120, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.fillStyle = activeColor;
      ctx.font = "bold 60px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(timeStr, 150, 150);

      ctx.font = "bold 20px Inter, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(activeLabel.toUpperCase(), 150, 200);
    };

    draw();
  }, [workTimerLeft, breakTimerLeft, isWorkTimerActive, isBreakTimerActive]);

  const togglePip = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        const stream = canvasRef.current.captureStream(10);
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          videoRef.current?.requestPictureInPicture();
        };
      }
    } catch (error) {
      console.error("Failed to enter Picture-in-Picture", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <canvas ref={canvasRef} width="300" height="300" className="hidden" />
      <video ref={videoRef} className="hidden" muted playsInline />

      {/* Work Timer */}
      <div className="flex items-center gap-2 bg-white border shadow-sm rounded-2xl px-3 h-12 hover:border-primary/30 transition-all group">
        <Brain className={cn("w-4 h-4 transition-colors", isWorkTimerActive ? "text-primary" : "text-muted-foreground")} />
        <span className="text-sm font-black tabular-nums tracking-tighter w-12 text-center">{formatTime(workTimerLeft)}</span>
        <div className="flex items-center gap-0.5 border-l pl-2">
          <Button variant="ghost" size="icon" onClick={() => setWorkTimerActive(!isWorkTimerActive)} className="h-8 w-8 rounded-xl">
            {isWorkTimerActive ? <Pause className="w-3.5 h-3.5 fill-current text-primary" /> : <Play className="w-3.5 h-3.5 fill-current text-primary" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={resetWorkTimer} className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive">
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Break Timer */}
      <div className="flex items-center gap-2 bg-white border shadow-sm rounded-2xl px-3 h-12 hover:border-accent/30 transition-all group">
        <Coffee className={cn("w-4 h-4 transition-colors", isBreakTimerActive ? "text-accent" : "text-muted-foreground")} />
        <span className="text-sm font-black tabular-nums tracking-tighter w-12 text-center">{formatTime(breakTimerLeft)}</span>
        <div className="flex items-center gap-0.5 border-l pl-2">
          <Button variant="ghost" size="icon" onClick={() => setBreakTimerActive(!isBreakTimerActive)} className="h-8 w-8 rounded-xl">
            {isBreakTimerActive ? <Pause className="w-3.5 h-3.5 fill-current text-accent" /> : <Play className="w-3.5 h-3.5 fill-current text-accent" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={resetBreakTimer} className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive">
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* PiP Controller */}
      {isPipAvailable && (
        <Button
          variant="outline"
          size="icon"
          onClick={togglePip}
          className="h-12 w-12 bg-white rounded-2xl shadow-sm text-muted-foreground hover:text-primary transition-all"
          title="Pop out active timer"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
