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

const MODE_CONFIG = {
  work: {
    label: "Focus Session",
    seconds: 25 * 60,
    accent: "bg-primary",
    color: "#1e40af", // primary
  },
  short: {
    label: "Short Break",
    seconds: 5 * 60,
    accent: "bg-accent",
    color: "#10b981", // accent
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
      const { color, label } = MODE_CONFIG[timerMode];
      const timeStr = formatTime(timerLeft);
      
      // Clear
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background Circle
      ctx.beginPath();
      ctx.arc(150, 150, 120, 0, Math.PI * 2);
      ctx.strokeStyle = "#f3f4f6";
      ctx.lineWidth = 20;
      ctx.stroke();

      // Progress Circle
      const progress = (timerLeft / MODE_CONFIG[timerMode].seconds);
      ctx.beginPath();
      ctx.arc(150, 150, 120, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
      ctx.strokeStyle = color;
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.stroke();

      // Text
      ctx.fillStyle = color;
      ctx.font = "bold 60px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(timeStr, 150, 150);

      ctx.font = "bold 20px Inter, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(label.toUpperCase(), 150, 200);
    };

    draw();
  }, [timerLeft, timerMode]);

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

  const progress = ((MODE_CONFIG[timerMode].seconds - timerLeft) / MODE_CONFIG[timerMode].seconds) * 100;

  return (
    <div id="tour-timer" className="relative flex items-center gap-3 bg-white border shadow-sm rounded-2xl px-4 h-12 transition-all hover:border-primary/30 group">
      {/* Hidden elements for PiP */}
      <canvas ref={canvasRef} width="300" height="300" className="hidden" />
      <video ref={videoRef} className="hidden" muted playsInline />

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

      <div className="flex items-center gap-0.5 border-l pl-2">
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
        {isPipAvailable && (
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePip}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary"
            title="Pop out timer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        )}
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
