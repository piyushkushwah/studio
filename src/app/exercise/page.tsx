"use client";

import { useState, useMemo } from "react";
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
import { 
  ArrowLeft, 
  Plus, 
  Dumbbell, 
  Trash2, 
  Flame, 
  Timer,
  Calendar as CalendarIcon,
  Activity,
  Zap,
  Clock
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const EXERCISE_TYPES = ["cardio", "strength", "flexibility", "other"];

export default function ExercisePage() {
  const { exercises, addExercise, deleteExercise, isInitialized } = useTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    durationMinutes: "",
    caloriesBurned: "",
    type: "cardio" as any,
    date: format(new Date(), "yyyy-MM-dd")
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const todayExercises = useMemo(() => {
    return exercises.filter(e => e.date === todayStr);
  }, [exercises, todayStr]);

  const totalCaloriesBurned = useMemo(() => {
    return todayExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
  }, [todayExercises]);

  const totalDuration = useMemo(() => {
    return todayExercises.reduce((sum, e) => sum + e.durationMinutes, 0);
  }, [todayExercises]);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    addExercise({
      name: formData.name,
      durationMinutes: parseInt(formData.durationMinutes) || 0,
      caloriesBurned: parseInt(formData.caloriesBurned) || 0,
      type: formData.type,
      date: formData.date
    });
    setFormData({
      name: "",
      durationMinutes: "",
      caloriesBurned: "",
      type: "cardio",
      date: todayStr
    });
    setIsDialogOpen(false);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">Loading Workout Log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-card shadow-sm border border-transparent hover:border-border">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-lg shadow-orange-200 dark:shadow-orange-900/20 shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-primary tracking-tight">Exercise Tracker</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Fitness & Activity Log</p>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="h-12 rounded-xl px-6 gap-2 bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-200 dark:shadow-orange-900/20">
          <Plus className="w-5 h-5" />
          Log Activity
        </Button>
      </header>

      <main className="w-full max-w-7xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-2xl shadow-orange-100 dark:shadow-orange-950/20 border-border bg-card backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest text-orange-700">Daily Burned</CardDescription>
              <CardTitle className="text-3xl font-black text-orange-600 flex items-center gap-2">
                <Flame className="w-6 h-6" />
                {totalCaloriesBurned} <span className="text-sm font-bold opacity-60">kcal</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-xl shadow-primary/5 border-border bg-card backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest">Total Active Time</CardDescription>
              <CardTitle className="text-3xl font-black text-primary flex items-center gap-2">
                <Timer className="w-6 h-6" />
                {totalDuration} <span className="text-sm font-bold opacity-60">mins</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-xl shadow-primary/5 border-border bg-card backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest">Sessions Today</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">
                {todayExercises.length}
              </CardTitle>
            </CardHeader>
          </div>

        <Card className="shadow-2xl shadow-primary/5 border-border bg-card/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b bg-card/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-primary">Workout History</CardTitle>
                <CardDescription>Track your consistent effort and physical growth</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {exercises.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center gap-6 p-8">
                  <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center text-muted-foreground/30">
                    <Activity className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-primary">No Activities Logged</h3>
                    <p className="text-muted-foreground text-sm font-medium max-w-[280px]">Start tracking your workouts to see your progress and stay motivated.</p>
                  </div>
                  <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="rounded-xl border-dashed">
                    Log First Session
                  </Button>
                </div>
              ) : (
                <div className="divide-y border-border">
                  {exercises.map((exercise) => (
                    <div 
                      key={exercise.id} 
                      className="group flex items-center justify-between p-4 md:p-6 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-2xl shadow-sm border border-border group-hover:border-orange-200 dark:group-hover:border-orange-800 transition-colors",
                          exercise.type === 'cardio' ? "bg-red-50 text-red-600" :
                          exercise.type === 'strength' ? "bg-orange-50 text-orange-600" :
                          exercise.type === 'flexibility' ? "bg-emerald-50 text-emerald-600" :
                          "bg-muted text-primary"
                        )}>
                          {exercise.type === 'cardio' ? <Zap className="w-5 h-5" /> : 
                           exercise.type === 'strength' ? <Dumbbell className="w-5 h-5" /> : 
                           <Activity className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-black text-primary text-sm md:text-base">{exercise.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full text-muted-foreground capitalize">
                              {exercise.type}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {exercise.durationMinutes} mins
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {format(parseISO(exercise.date), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-orange-600 text-lg">
                            {exercise.caloriesBurned}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">kcal</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteExercise(exercise.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary tracking-tight">Record Activity</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest">Track your physical effort</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <UILabel htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Exercise Name</UILabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Morning Run, Deadlifts"
                className="h-12 rounded-xl bg-muted/30 border-transparent font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Type</UILabel>
                <Select value={formData.type} onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-transparent capitalize font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <UILabel htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Date</UILabel>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="h-12 rounded-xl bg-muted/30 border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <UILabel htmlFor="duration" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Duration (mins)</UILabel>
                <Input
                  id="duration"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: e.target.value }))}
                  placeholder="0"
                  className="h-12 rounded-xl bg-muted/30 border-transparent font-bold"
                />
              </div>
              <div className="space-y-2">
                <UILabel htmlFor="calories" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Burned (kcal)</UILabel>
                <Input
                  id="calories"
                  type="number"
                  value={formData.caloriesBurned}
                  onChange={(e) => setFormData(prev => ({ ...prev, caloriesBurned: e.target.value }))}
                  placeholder="0"
                  className="h-12 rounded-xl bg-muted/30 border-transparent font-bold"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={!formData.name.trim()} className="w-full h-12 rounded-xl font-bold bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-200">
              Confirm Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
