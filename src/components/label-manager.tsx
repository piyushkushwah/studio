
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
        <Button variant="ghost" className="flex flex-col items-center justify-center gap-0 h-auto py-1 px-3 rounded-xl hover:bg-primary/5 group" title="Manage Labels">
          <Tag className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
          <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/60 mt-0.5">Labels</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Task Labels</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <form onSubmit={handleAdd} className="space-y-4 bg-muted/30 p-4 rounded-xl border border-dashed">
            <div className="space-y-2">
              <Label htmlFor="label-name">New Label Name</Label>
              <Input
                id="label-name"
                placeholder="e.g. Fitness, Study, Work"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={20}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Select High Contrast Color
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

            <Button type="submit" className="w-full" disabled={!newName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Label
            </Button>
          </form>

          <div className="space-y-3">
            <Label>Existing Labels</Label>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2">
              {labels.map((label) => (
                <div key={label.id} className="group relative">
                  <Badge className={cn("px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm", label.color)}>
                    {label.name}
                  </Badge>
                  <button
                    onClick={() => deleteLabel(label.id)}
                    className="absolute -top-1.5 -right-1.5 bg-background border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
