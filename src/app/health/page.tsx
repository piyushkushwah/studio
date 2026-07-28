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
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Plus, 
  Droplets, 
  Utensils, 
  Trash2, 
  Flame, 
  Coffee,
  Apple,
  Zap,
  ChevronRight,
  TrendingUp,
  Settings
} from "lucide-react";
import Link from "next/link";
import { format, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export default function HealthPage() {
  const { 
    diet, 
    water, 
    addDietEntry, 
    deleteDietEntry, 
    addWaterEntry, 
    deleteWaterEntry,
    waterGoal,
    setWaterGoal,
    calorieGoal,
    setCalorieGoal,
    isInitialized 
  } = useTasks();

  const [isDietDialogOpen, setIsDietDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [dietForm, setDietForm] = useState({
    name: "",
    calories: "",
    mealType: "breakfast" as any,
    date: format(new Date(), "yyyy-MM-dd")
  });

  const [goalForm, setGoalForm] = useState({
    water: waterGoal.toString(),
    calorie: calorieGoal.toString()
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const todayDiet = useMemo(() => diet.filter(d => d.date === todayStr), [diet, todayStr]);
  const todayWater = useMemo(() => water.filter(w => w.date === todayStr), [water, todayStr]);

  const totalCalories = useMemo(() => todayDiet.reduce((sum, d) => sum + d.calories, 0), [todayDiet]);
  const totalWater = useMemo(() => todayWater.reduce((sum, w) => sum + w.amount, 0), [todayWater]);

  const waterProgress = Math.min((totalWater / waterGoal) * 100, 100);
  const calorieProgress = Math.min((totalCalories / calorieGoal) * 100, 100);

  const handleAddDiet = () => {
    if (!dietForm.name) return;
    addDietEntry({
      name: dietForm.name,
      calories: parseInt(dietForm.calories) || 0,
      mealType: dietForm.mealType,
      date: dietForm.date
    });
    setDietForm({ name: "", calories: "", mealType: "breakfast", date: todayStr });
    setIsDietDialogOpen(false);
  };

  const handleSaveGoals = () => {
    setWaterGoal(parseInt(goalForm.water) || 2000);
    setCalorieGoal(parseInt(goalForm.calorie) || 2000);
    setIsGoalDialogOpen(false);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">Syncing Health Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-5xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-card shadow-sm border border-transparent hover:border-border">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="bg-sky-500 text-white p-2.5 rounded-xl shadow-lg shadow-sky-200 dark:shadow-sky-900/20 shrink-0">
            <Apple className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-primary tracking-tight">Health Dashboard</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Diet & Hydration Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsGoalDialogOpen(true)}
            className="h-12 rounded-xl px-4 gap-2 border-primary/20 hover:bg-primary/5"
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Set Goals</span>
          </Button>
          <Button onClick={() => setIsDietDialogOpen(true)} className="h-12 rounded-xl px-6 gap-2 bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-200 dark:shadow-sky-900/20">
            <Plus className="w-5 h-5" />
            Log Meal
          </Button>
        </div>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hydration Tracker */}
          <Card className="shadow-2xl shadow-sky-100 dark:shadow-sky-950/20 border-border bg-card backdrop-blur-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-sky-50/50 dark:bg-sky-900/10 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-sky-600" />
                  <CardTitle className="text-lg font-black text-sky-900 dark:text-sky-100">Hydration</CardTitle>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-sky-700 dark:text-sky-400">{totalWater}</span>
                  <span className="text-xs font-bold text-muted-foreground ml-1">/ {waterGoal}ml</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Progress value={waterProgress} className="h-3 bg-sky-100 dark:bg-sky-900/30" />
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 text-center">
                  {Math.round(waterProgress)}% OF DAILY TARGET
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[250, 500, 750, 1000].map(amount => (
                  <Button 
                    key={amount}
                    variant="outline"
                    onClick={() => addWaterEntry(amount)}
                    className="h-16 flex flex-col gap-1 rounded-2xl border-sky-100 hover:bg-sky-50 dark:border-sky-800 dark:hover:bg-sky-900/20"
                  >
                    <span className="text-xs font-black">{amount}</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">ML</span>
                  </Button>
                ))}
              </div>
              <ScrollArea className="h-[200px]">
                {todayWater.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8 font-medium italic">No hydration logs yet.</p>
                ) : (
                  <div className="space-y-2">
                    {todayWater.sort((a,b) => b.createdAt - a.createdAt).map(log => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
                            <Droplets className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-black text-primary">+{log.amount}ml</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteWaterEntry(log.id)}
                          className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Diet Tracker */}
          <Card className="shadow-2xl shadow-emerald-100 dark:shadow-emerald-950/20 border-border bg-card backdrop-blur-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-lg font-black text-emerald-900 dark:text-emerald-100">Nutrition</CardTitle>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{totalCalories}</span>
                  <span className="text-xs font-bold text-muted-foreground ml-1">/ {calorieGoal}kcal</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Progress value={calorieProgress} className="h-3 bg-emerald-100 dark:bg-emerald-900/30" />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-center">
                  {Math.round(calorieProgress)}% OF ENERGY BUDGET
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[280px]">
                {todayDiet.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/30">
                      <Apple className="w-6 h-6" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium max-w-[200px]">Fuel your focus. Log your first meal of the day.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayDiet.sort((a,b) => b.createdAt - a.createdAt).map(entry => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl group border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600",
                            "bg-emerald-100/50 dark:bg-emerald-900/20"
                          )}>
                            {entry.mealType === 'breakfast' ? <Coffee className="w-5 h-5" /> : 
                             entry.mealType === 'snack' ? <Apple className="w-5 h-5" /> : 
                             <Utensils className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-primary leading-tight">{entry.name}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">{entry.mealType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-emerald-600">{entry.calories} kcal</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteDietEntry(entry.id)}
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
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
        </div>
      </main>

      {/* Goal Settings Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary tracking-tight">Health Targets</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest">Personalize your daily limits</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Water Goal (ml)</UILabel>
              <Input 
                type="number"
                value={goalForm.water}
                onChange={e => setGoalForm(prev => ({ ...prev, water: e.target.value }))}
                className="h-12 rounded-xl bg-muted/30 border-transparent text-lg font-black"
              />
            </div>
            <div className="space-y-2">
              <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Calorie Target (kcal)</UILabel>
              <Input 
                type="number"
                value={goalForm.calorie}
                onChange={e => setGoalForm(prev => ({ ...prev, calorie: e.target.value }))}
                className="h-12 rounded-xl bg-muted/30 border-transparent text-lg font-black"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveGoals} className="w-full h-12 rounded-xl font-bold bg-primary shadow-xl shadow-primary/20">
              Update Goals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meal Log Dialog */}
      <Dialog open={isDietDialogOpen} onOpenChange={setIsDietDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary tracking-tight">Record Nutrition</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest">Track your fuel for the day</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Food / Drink Name</UILabel>
              <Input 
                value={dietForm.name}
                onChange={e => setDietForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Avocado Toast"
                className="h-12 rounded-xl bg-muted/30 border-transparent font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Energy (kcal)</UILabel>
                <Input 
                  type="number"
                  value={dietForm.calories}
                  onChange={e => setDietForm(prev => ({ ...prev, calories: e.target.value }))}
                  placeholder="0"
                  className="h-12 rounded-xl bg-muted/30 border-transparent font-bold"
                />
              </div>
              <div className="space-y-2">
                <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Meal Type</UILabel>
                <Select value={dietForm.mealType} onValueChange={val => setDietForm(prev => ({ ...prev, mealType: val }))}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-transparent capitalize font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddDiet} disabled={!dietForm.name} className="w-full h-12 rounded-xl font-bold bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-200">
              Confirm Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}