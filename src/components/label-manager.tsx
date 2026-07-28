"use client";

import { useState, useCallback } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Tag, Plus, X, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
  { name: "Blue", value: "bg-blue-600 text-white hover:bg-blue-700" },
  { name: "Purple", value: "bg-purple-600 text-white hover:bg-purple-700" },
  { name: "Orange", value: "bg-orange-500 text-white hover:bg-orange-600" },
  { name: "Red", value: "bg-red-600 text-white hover:bg-red-700" },
  { name: "Green", value: "bg-emerald-600 text-white hover:bg-emerald-700" },
  { name: "Pink", value: "bg-pink-600 text-white hover:bg-pink-700" },
  { name: "Gray", value: "bg-slate-700 text-white hover:bg-slate-800" },
];

export function LabelManager() {
  const { labels, addLabel, deleteLabel } = useTasks();
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].value);
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (labels.some(l => l.name.toLowerCase() === trimmed.toLowerCase())) return;

    addLabel(trimmed, selectedColor);
    setNewName("");
  }, [newName, labels, selectedColor, addLabel]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex flex-col items-center justify-center gap-0.5 h-11 w-12 rounded-xl hover:bg-primary/5 group" title="Manage Labels">
          <Tag className="w-4 h-4 text-primary transition-transform group-hover:scale-110 shrink-0" />
          <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/60 leading-none">Labels</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-primary">Manage Categories</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <form onSubmit={handleAdd} className="space-y-4 bg-muted/30 p-5 rounded-2xl border border-dashed border-border/50">
            <div className="space-y-2">
              <Label htmlFor="label-name" className="text-[10px] font-black uppercase tracking-widest text-primary/60">New Label Name</Label>
              <Input
                id="label-name"
                placeholder="e.g. Fitness, Study, Work"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={20}
                className="rounded-xl h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                <Palette className="w-3.5 h-3.5" />
                Category Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all shadow-sm",
                      color.value.split(' ')[0],
                      selectedColor === color.value ? "ring-2 ring-primary ring-offset-2 scale-110" : "border-white/50 opacity-80 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl font-black uppercase text-xs" disabled={!newName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Label
            </Button>
          </form>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Existing Labels</Label>
            <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {labels.map((label) => (
                <div key={label.id} className="group relative">
                  <Badge className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm rounded-xl", label.color)}>
                    {label.name}
                  </Badge>
                  <button
                    onClick={() => deleteLabel(label.id)}
                    className="absolute -top-1.5 -right-1.5 bg-background border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground shadow-md"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} className="w-full h-12 rounded-xl font-black uppercase text-sm bg-muted text-primary hover:bg-muted/80">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
