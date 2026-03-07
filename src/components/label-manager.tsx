"use client";

import { useState } from "react";
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
  { name: "Blue", value: "bg-blue-100 text-blue-700" },
  { name: "Purple", value: "bg-purple-100 text-purple-700" },
  { name: "Orange", value: "bg-orange-100 text-orange-700" },
  { name: "Red", value: "bg-red-100 text-red-700" },
  { name: "Green", value: "bg-emerald-100 text-emerald-700" },
  { name: "Pink", value: "bg-pink-100 text-pink-700" },
  { name: "Gray", value: "bg-gray-100 text-gray-700" },
];

export function LabelManager() {
  const { labels, addLabel, deleteLabel } = useTasks();
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].value);
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    // Avoid duplicates
    if (labels.some(l => l.name.toLowerCase() === newName.toLowerCase().trim())) {
      return;
    }

    addLabel(newName, selectedColor);
    setNewName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shadow-sm" title="Manage Labels">
          <Tag className="w-5 h-5 text-primary" />
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
                Select Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      color.value.split(' ')[0],
                      selectedColor === color.value ? "ring-2 ring-primary ring-offset-2 scale-110" : "border-transparent opacity-70 hover:opacity-100"
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
                  <Badge className={cn("px-3 py-1 text-xs font-bold uppercase tracking-wider", label.color)}>
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
