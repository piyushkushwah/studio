
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
  CloudRain, 
  TreePine, 
  Coffee, 
  Wind,
  Play,
  Pause,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Using widely supported public domain MP3 assets from Archive.org
const SOUNDS = [
  { 
    id: "rain", 
    label: "Rain", 
    icon: CloudRain, 
    url: "https://archive.org/download/heavy_rain_loop/heavy_rain_loop.mp3",
    type: "audio/mpeg"
  },
  { 
    id: "forest", 
    label: "Forest", 
    icon: TreePine, 
    url: "https://archive.org/download/morning-birds-singing-in-the-forest/morning-birds-singing-in-the-forest.mp3",
    type: "audio/mpeg"
  },
  { 
    id: "coffee", 
    label: "Cafe", 
    icon: Coffee, 
    url: "https://archive.org/download/cafe-ambience/cafe-ambience.mp3",
    type: "audio/mpeg"
  },
  { 
    id: "white-noise", 
    label: "Static", 
    icon: Wind, 
    url: "https://archive.org/download/white-noise-10-min/white-noise-10-min.mp3",
    type: "audio/mpeg"
  },
];

export function FocusPlayer() {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState([50]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  // Audio management
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

  const handlePlay = async () => {
    if (!audioRef.current || !activeSoundId) return;
    try {
      setHasError(false);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Playback Error:", err);
        setHasError(true);
        setIsPlaying(false);
      }
    }
  };

  const toggleSound = (soundId: string) => {
    if (activeSoundId === soundId) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        handlePlay();
      }
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
      title: "Sound Unavailable",
      description: "We're having trouble reaching the sound server. Please try a different track.",
    });
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    if (isPlaying) {
      handlePlay();
    }
  };

  const activeSoundLabel = SOUNDS.find(s => s.id === activeSoundId)?.label || "Off";

  return (
    <div className="flex items-center gap-2">
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
        onError={handleAudioError}
        onCanPlay={handleCanPlay}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
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
              <span className="text-xs font-bold truncate max-w-[60px]">
                {activeSoundId ? activeSoundLabel : "Off"}
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 rounded-[1.5rem] shadow-2xl border-primary/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-primary text-sm uppercase tracking-widest">Soundscapes</h4>
              {activeSoundId && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              )}
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
                      "h-16 flex flex-col gap-1 rounded-xl transition-all border-primary/5",
                      isActive && isPlaying && !hasError ? "ring-2 ring-primary ring-offset-2" : "",
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
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{sound.label}</span>
                  </Button>
                );
              })}
            </div>

            <div className="space-y-3 pt-2">
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
              <p className="text-[10px] text-destructive font-bold text-center animate-pulse">
                Connection issue. Try another track.
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
