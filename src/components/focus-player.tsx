
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
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
  Square,
  Plus,
  Trash2,
  ScrollArea
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTasks } from "@/hooks/use-tasks";

const DEFAULT_SOUNDS = [
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
  const { customSongs, addCustomSong, removeCustomSong } = useTasks();
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState([40]);
  
  // New Song Form State
  const [newSongLabel, setNewSongLabel] = useState("");
  const [newSongUrl, setNewSongUrl] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const allSounds = useMemo(() => [
    ...DEFAULT_SOUNDS,
    ...customSongs.map(s => ({ ...s, icon: Music }))
  ], [customSongs]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume[0] / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!activeSoundId) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    const sound = allSounds.find(s => s.id === activeSoundId);
    if (sound && audio.src !== sound.url) {
      setIsLoading(true);
      setHasError(false);
      audio.pause();
      audio.src = sound.url;
      audio.load();
    }
  }, [activeSoundId, allSounds]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeSoundId || isLoading) return;
    if (isPlaying) {
      audio.play().catch((err) => {
        if (err.name !== 'AbortError') setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, activeSoundId, isLoading]);

  const toggleSound = (soundId: string) => {
    if (activeSoundId === soundId) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveSoundId(soundId);
      setIsPlaying(true);
    }
  };

  const handleAddSong = () => {
    if (!newSongLabel || !newSongUrl) return;
    addCustomSong(newSongLabel, newSongUrl);
    setNewSongLabel("");
    setNewSongUrl("");
    setShowAddForm(false);
    toast({ title: "Song Added", description: "Your custom track is now in the library." });
  };

  const activeSoundLabel = allSounds.find(s => s.id === activeSoundId)?.label || "Off";

  return (
    <div className="flex items-center gap-2">
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
        onCanPlay={() => setIsLoading(false)}
      />
      
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-1 bg-card border border-border shadow-sm rounded-2xl px-2 h-12 hover:border-primary/30 transition-all cursor-pointer group">
            <Button
              variant="ghost" size="icon"
              className={cn("h-9 w-9 rounded-xl", isPlaying && "text-primary bg-primary/5", hasError && "text-destructive")}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className={cn("w-4 h-4", isPlaying && "animate-pulse")} />}
            </Button>
            <div className="hidden md:flex flex-col pr-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-0.5">Focus Radio</span>
              <span className="text-xs font-bold truncate max-w-[70px] text-primary">{activeSoundId ? activeSoundLabel : "Off"}</span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 rounded-[1.5rem] shadow-2xl border-primary/10 bg-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-primary text-sm uppercase tracking-widest">Focus Radio</h4>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {showAddForm && (
              <div className="bg-muted/30 p-3 rounded-xl space-y-2 border border-dashed border-border">
                <Input placeholder="Track Name" value={newSongLabel} onChange={e => setNewSongLabel(e.target.value)} className="h-8 text-xs bg-background" />
                <Input placeholder="MP3 URL" value={newSongUrl} onChange={e => setNewSongUrl(e.target.value)} className="h-8 text-xs bg-background" />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-[10px] uppercase font-bold" onClick={handleAddSong}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-8 text-[10px] uppercase font-bold" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
              {allSounds.map((sound) => {
                const Icon = sound.icon;
                const isActive = activeSoundId === sound.id;
                const isCustom = !DEFAULT_SOUNDS.some(d => d.id === sound.id);
                return (
                  <div key={sound.id} className="relative group/item">
                    <Button
                      variant={isActive ? "default" : "outline"}
                      className={cn(
                        "h-16 w-full flex flex-col gap-1 rounded-xl transition-all p-2",
                        isActive && isPlaying ? "ring-2 ring-primary ring-offset-2" : ""
                      )}
                      onClick={() => toggleSound(sound.id)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-full">{sound.label}</span>
                    </Button>
                    {isCustom && (
                      <button 
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); removeCustomSong(sound.id); }}
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>Volume</span>
                <span>{volume[0]}%</span>
              </div>
              <div className="flex items-center gap-3">
                {volume[0] === 0 ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
