
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
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const SOUNDS = [
  { 
    id: "rain", 
    label: "Rain", 
    icon: CloudRain, 
    url: "https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg" 
  },
  { 
    id: "forest", 
    label: "Forest", 
    icon: TreePine, 
    url: "https://actions.google.com/sounds/v1/ambient/forest_ambience.ogg" 
  },
  { 
    id: "coffee", 
    label: "Cafe", 
    icon: Coffee, 
    url: "https://actions.google.com/sounds/v1/crowds/city_market_ambience.ogg" 
  },
  { 
    id: "white-noise", 
    label: "Static", 
    icon: Wind, 
    url: "https://actions.google.com/sounds/v1/weather/heavy_wind_and_rain.ogg" 
  },
];

export function FocusPlayer() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState([50]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const handlePlay = async () => {
    if (!audioRef.current) return;
    try {
      setHasError(false);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Playback failed:", err);
      setIsPlaying(false);
      // Don't toast for "play() interrupted" errors as they are common and harmless
      if (err instanceof Error && err.name !== 'AbortError') {
        setHasError(true);
      }
    }
  };

  const toggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        handlePlay();
      }
    } else {
      const sound = SOUNDS.find(s => s.id === soundId);
      if (sound && audioRef.current) {
        // Reset and load new source
        audioRef.current.pause();
        audioRef.current.src = sound.url;
        audioRef.current.load(); // Crucial: reload the media element with the new source
        setActiveSound(soundId);
        handlePlay();
      }
    }
  };

  const handleGlobalToggle = () => {
    if (!activeSound) {
      toggleSound(SOUNDS[0].id);
    } else {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        handlePlay();
      }
    }
  };

  const handleAudioError = () => {
    setHasError(true);
    setIsPlaying(false);
    toast({
      variant: "destructive",
      title: "Audio Error",
      description: "Could not load the focus sound. Please try another one.",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <audio 
        ref={audioRef} 
        loop 
        onError={handleAudioError}
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
              {hasError ? <AlertCircle className="w-4 h-4" /> : <Music className={cn("w-4 h-4", isPlaying && "animate-pulse")} />}
            </Button>
            <div className="hidden md:flex flex-col pr-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-0.5">Focus Music</span>
              <span className="text-xs font-bold truncate max-w-[60px]">
                {activeSound ? SOUNDS.find(s => s.id === activeSound)?.label : "Off"}
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 rounded-[1.5rem] shadow-2xl border-primary/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-primary text-sm uppercase tracking-widest">Soundscapes</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={handleGlobalToggle}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SOUNDS.map((sound) => {
                const Icon = sound.icon;
                const isActive = activeSound === sound.id;
                return (
                  <Button
                    key={sound.id}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "h-16 flex flex-col gap-1 rounded-xl transition-all border-primary/5",
                      isActive && isPlaying ? "ring-2 ring-primary ring-offset-2" : ""
                    )}
                    onClick={() => toggleSound(sound.id)}
                  >
                    <Icon className="w-4 h-4" />
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
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
