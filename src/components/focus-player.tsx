"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Headphones,
  Play,
  Pause,
  AlertCircle,
  Loader2,
  Sparkles,
  Square
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Verified high-quality tracks for deep focus
const SOUNDS = [
  { 
    id: "jazzy-lofi", 
    label: "KaizanBlu Lofi", 
    icon: Headphones, 
    url: "https://archive.org/download/kalaido-hanging-lanterns_202101/%5BNo%20Copyright%20Music%5D%20Chill%20Jazzy%20Lofi%20Hip-Hop%20Beat%20%28Copyright%20Free%29%20Music%20By%20KaizanBlu.mp3",
  },
  { 
    id: "jazz-bread", 
    label: "Lukrembo - Bread", 
    icon: Sparkles, 
    url: "https://archive.org/download/kalaido-hanging-lanterns_202101/%28no%20copyright%20music%29%20jazz%20type%20beat%20bread%20royalty%20free%20youtube%20music%20prod.%20by%20lukrembo.mp3",
  },
];

export function FocusPlayer() {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState([40]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  // Handle Source Changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!activeSoundId) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    const sound = SOUNDS.find(s => s.id === activeSoundId);
    if (sound && audio.src !== sound.url) {
      setIsLoading(true);
      setHasError(false);
      audio.pause();
      audio.src = sound.url;
      audio.load();
    }
  }, [activeSoundId]);

  // Sync Playback State
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeSoundId || isLoading) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.error("Playback failed:", err);
          setIsPlaying(false);
        }
      });
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [isPlaying, activeSoundId, isLoading]);

  const toggleSound = (soundId: string) => {
    if (activeSoundId === soundId) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveSoundId(soundId);
      setIsPlaying(true);
    }
  };

  const handleAudioError = (e: any) => {
    console.error("Audio Load Error:", e);
    setHasError(true);
    setIsPlaying(false);
    setIsLoading(false);
    toast({
      variant: "destructive",
      title: "Stream Unavailable",
      description: "We couldn't reach the focus track. Please try again or check your connection.",
    });
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const activeSoundLabel = SOUNDS.find(s => s.id === activeSoundId)?.label || "Off";

  return (
    <div className="flex items-center gap-2">
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
        crossOrigin="anonymous"
        onError={handleAudioError}
        onCanPlay={handleCanPlay}
      />
      
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-1 bg-white border shadow-sm rounded-2xl px-2 h-12 hover:border-primary/30 transition-all cursor-pointer group">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-xl transition-colors",
                isPlaying ? "text-primary bg-primary/5" : "text-muted-foreground",
                hasError && "text-destructive"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : hasError ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Music className={cn("w-4 h-4", isPlaying && "animate-pulse")} />
              )}
            </Button>
            <div className="hidden md:flex flex-col pr-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-0.5">Focus Music</span>
              <span className="text-xs font-bold truncate max-w-[70px]">
                {activeSoundId ? activeSoundLabel : "Off"}
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4 rounded-[1.5rem] shadow-2xl border-primary/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-primary text-sm uppercase tracking-widest">Focus Radio</h4>
              <div className="flex items-center gap-1">
                {activeSoundId && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => setActiveSoundId(null)}
                    >
                      <Square className="w-3 h-3 fill-current" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SOUNDS.map((sound) => {
                const Icon = sound.icon;
                const isActive = activeSoundId === sound.id;
                return (
                  <Button
                    key={sound.id}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "h-16 flex flex-col gap-1 rounded-xl transition-all border-primary/5 p-2 overflow-hidden",
                      isActive && isPlaying && !hasError ? "ring-2 ring-primary ring-offset-2 shadow-inner" : "",
                      isActive && hasError ? "border-destructive text-destructive" : ""
                    )}
                    onClick={() => toggleSound(sound.id)}
                    disabled={isLoading && !isActive}
                  >
                    {isLoading && isActive ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                      {sound.label}
                    </span>
                  </Button>
                );
              })}
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>Volume</span>
                <span>{volume[0]}%</span>
              </div>
              <div className="flex items-center gap-3">
                {volume[0] === 0 ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
            
            {hasError && (
              <p className="text-[10px] text-destructive font-bold text-center animate-pulse leading-tight">
                Connection issue with this track.<br/>Try again.
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}