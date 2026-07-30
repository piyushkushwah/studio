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
          <div className="flex items-center gap-3 bg-card border border-border shadow-sm rounded-2xl px-4 h-12 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
            <Button
              variant="ghost" size="icon"
              className={cn("h-9 w-9 rounded-xl", isPlaying && "text-indigo-600 bg-indigo-50", hasError && "text-red-500")}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className={cn("w-5 h-5 text-indigo-600", isPlaying && "animate-pulse")} />}
            </Button>
            <div className="flex flex-col pr-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Focus Radio</span>
              <span className="text-xs font-black truncate max-w-[80px] text-indigo-700">{activeSoundId ? activeSoundLabel : "Off"}</span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-5 rounded-[2rem] shadow-2xl border-indigo-100 bg-card">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-indigo-700 text-sm uppercase tracking-widest">Atmosphere</h4>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-indigo-50" onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="w-5 h-5 text-indigo-600" />
              </Button>
            </div>

            {showAddForm && (
              <div className="bg-muted/30 p-4 rounded-2xl space-y-3 border border-dashed border-indigo-200">
                <Input placeholder="Track Name" value={newSongLabel} onChange={e => setNewSongLabel(e.target.value)} className="h-9 text-xs bg-background rounded-xl" />
                <Input placeholder="MP3 URL" value={newSongUrl} onChange={e => setNewSongUrl(e.target.value)} className="h-9 text-xs bg-background rounded-xl" />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-9 text-[10px] uppercase font-black rounded-xl bg-indigo-600 hover:bg-indigo-700" onClick={handleAddSong}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-9 text-[10px] uppercase font-black rounded-xl" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2">
              {allSounds.map((sound) => {
                const Icon = sound.icon;
                const isActive = activeSoundId === sound.id;
                const isCustom = !DEFAULT_SOUNDS.some(d => d.id === sound.id);
                return (
                  <div key={sound.id} className="relative group/item">
                    <Button
                      variant={isActive ? "default" : "outline"}
                      className={cn(
                        "h-20 w-full flex flex-col gap-2 rounded-2xl transition-all p-3 border-border/50",
                        isActive ? "bg-indigo-600 text-white" : "hover:border-indigo-300 hover:bg-indigo-50/50",
                        isActive && isPlaying ? "ring-2 ring-indigo-400 ring-offset-2" : ""
                      )}
                      onClick={() => toggleSound(sound.id)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-tighter truncate w-full text-center">{sound.label}</span>
                    </Button>
                    {isCustom && (
                      <button 
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/item:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); removeCustomSong(sound.id); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>Volume Control</span>
                <span className="text-indigo-600">{volume[0]}%</span>
              </div>
              <div className="flex items-center gap-4">
                {volume[0] === 0 ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-indigo-600" />}
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
