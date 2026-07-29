
"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Plus, 
  CalendarDays, 
  Trash2, 
  Clock, 
  CheckCircle2,
  Pencil,
  Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Routine, RoutineFrequency } from "@/lib/types";

const FREQUENCIES: { value: RoutineFrequency; label: string }[] = [
  { value: "daily", label: "Every Day" },
  { value: "weekdays", label: "Mon - Fri" },
  { value: "weekends", label: "Sat - Sun" },
  { value: "weekly", label: "Once a Week" },
];

export default function RoutinesPage() {
  const { routines, addRoutine, updateRoutine, deleteRoutine, isInitialized } = useTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    frequency: "daily" as RoutineFrequency,
    active: true
  });

  const handleOpenDialog = (routine: Routine | null = null) => {
    if (routine) {
      setEditingRoutine(routine);
      setFormData({
        title: routine.title,
        description: routine.description || "",
        startTime: routine.startTime || "",
        endTime: routine.endTime || "",
        frequency: routine.frequency,
        active: routine.active
      });
    } else {
      setEditingRoutine(null);
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        frequency: "daily",
        active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;

    if (editingRoutine) {
      updateRoutine(editingRoutine.id, formData);
    } else {
      addRoutine(formData);
    }
    setIsDialogOpen(false);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">Building Schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background p-4 md:p-8 flex flex-col">
      <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl text-primary hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-primary tracking-tight">Routine Creator</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Recurring Task Architecture</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleOpenDialog()} className="h-12 rounded-xl px-6 gap-2 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-blue-900/20">
            <Plus className="w-5 h-5" />
            Add Routine
          </Button>
        </div>
      </header>

      <main className="w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-xl shadow-primary/5 border-border bg-card/80 backdrop-blur-sm rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest">Active Routines</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">
                {routines.filter(r => r.active).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-xl shadow-primary/5 border-border bg-card/80 backdrop-blur-sm rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest">Daily Sprints</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">
                {routines.filter(r => r.frequency === 'daily').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-xl shadow-primary/5 border-border bg-card/80 backdrop-blur-sm rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest">Total Templates</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">
                {routines.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-2xl shadow-primary/5 border-border bg-card/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="border-b bg-card/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-primary">Your Master Schedule</CardTitle>
                <CardDescription>Managed recurring activities for consistent growth</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {routines.length === 0 ? (
                <div className="h-[500px] flex flex-col items-center justify-center text-center gap-6 p-8">
                  <div className="w-24 h-24 bg-muted rounded-[2.5rem] flex items-center justify-center text-muted-foreground/30">
                    <Zap className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-primary">No Routines Defined</h3>
                    <p className="text-muted-foreground text-sm font-medium max-w-[280px]">Automate your recurring success by defining your first routine today.</p>
                  </div>
                  <Button onClick={() => handleOpenDialog()} variant="outline" className="rounded-xl border-dashed">
                    Add First Routine
                  </Button>
                </div>
              ) : (
                <div className="divide-y border-border">
                  {routines.map((routine) => (
                    <div 
                      key={routine.id} 
                      className={cn(
                        "group flex items-center justify-between p-6 hover:bg-muted/30 transition-all",
                        !routine.active && "opacity-60 grayscale-[0.5]"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "p-4 rounded-2xl shadow-sm border border-border transition-colors",
                          routine.active ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-muted text-muted-foreground"
                        )}>
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-primary text-base md:text-lg">{routine.title}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full text-muted-foreground capitalize">
                              {routine.frequency}
                            </span>
                            {(routine.startTime || routine.endTime) && (
                              <span className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {routine.startTime || "--:--"} to {routine.endTime || "--:--"}
                              </span>
                            )}
                          </div>
                          {routine.description && (
                            <p className="text-xs text-muted-foreground max-w-md line-clamp-1">{routine.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:inline">Active</span>
                          <Switch 
                            checked={routine.active} 
                            onCheckedChange={(val) => updateRoutine(routine.id, { active: val })} 
                          />
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleOpenDialog(routine)}>
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:text-destructive" onClick={() => deleteRoutine(routine.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      {/* Routine Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <div className="p-8 space-y-8 bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-primary tracking-tight">
                {editingRoutine ? "Refine Routine" : "Design Schedule"}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                Building consistent daily output
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <UILabel htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Routine Title</UILabel>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. 5AM Morning Flow, Weekly Review"
                  className="h-12 rounded-xl bg-muted/30 border-transparent text-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Frequency</UILabel>
                  <Select value={formData.frequency} onValueChange={(val: any) => setFormData(prev => ({ ...prev, frequency: val }))}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-transparent font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <UILabel htmlFor="startTime" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Start</UILabel>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="h-12 rounded-xl bg-muted/30 border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <UILabel htmlFor="endTime" className="text-[10px] font-black uppercase tracking-widest text-primary/60">End</UILabel>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="h-12 rounded-xl bg-muted/30 border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <UILabel htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Instructions (Optional)</UILabel>
                <Input
                  id="desc"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Steps or notes for this routine..."
                  className="h-12 rounded-xl bg-muted/30 border-transparent"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <Button variant="ghost" className="h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsDialogOpen(false)}>
                Discard
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!formData.title.trim()}
                className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 flex-1"
              >
                {editingRoutine ? "Update Template" : "Confirm Routine"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
