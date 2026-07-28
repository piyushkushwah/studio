
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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
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
  Settings,
  Scale,
  User,
  Activity,
  Target
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
    height,
    weight,
    setPhysicalProfile,
    isInitialized 
  } = useTasks();

  const [isDietDialogOpen, setIsDietDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
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

  const [profileForm, setProfileForm] = useState({
    height: height.toString(),
    weight: weight.toString()
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const todayDiet = useMemo(() => diet.filter(d => d.date === todayStr), [diet, todayStr]);
  const todayWater = useMemo(() => water.filter(w => w.date === todayStr), [water, todayStr]);

  const totalCalories = useMemo(() => todayDiet.reduce((sum, d) => sum + d.calories, 0), [todayDiet]);
  const totalWater = useMemo(() => todayWater.reduce((sum, w) => sum + w.amount, 0), [todayWater]);

  const waterProgress = Math.min((totalWater / waterGoal) * 100, 100);
  const calorieProgress = Math.min((totalCalories / calorieGoal) * 100, 100);

  // BMI Calculation
  const bmi = useMemo(() => {
    if (!height || !weight) return 0;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }, [height, weight]);

  const bmiStatus = useMemo(() => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500", bg: "bg-blue-500/10" };
    if (bmi < 25) return { label: "Healthy", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (bmi < 30) return { label: "Overweight", color: "text-orange-500", bg: "bg-orange-500/10" };
    return { label: "Obese", color: "text-destructive", bg: "bg-destructive/10" };
  }, [bmi]);

  // BMR Calculation (Mifflin-St Jeor Equation - simplified to a gender-neutral average)
  const bmr = useMemo(() => {
    if (!height || !weight) return 2000;
    // Base BMR for moderate activity
    return Math.round((10 * weight) + (6.25 * height) - (5 * 30) + 5); 
  }, [height, weight]);

  const recommendedGoals = useMemo(() => {
    const maintenance = bmr * 1.375; // Moderate activity factor
    return [
      { name: "Fat Loss", value: Math.round(maintenance - 500), color: "hsl(var(--destructive))" },
      { name: "Maintain", value: Math.round(maintenance), color: "hsl(var(--primary))" },
      { name: "Muscle Gain", value: Math.round(maintenance + 300), color: "hsl(var(--accent))" },
    ];
  }, [bmr]);

  const calorieChartData = useMemo(() => {
    return [
      { name: 'Target', value: calorieGoal, fill: 'hsl(var(--primary))' },
      { name: 'Current', value: totalCalories, fill: totalCalories > calorieGoal ? 'hsl(var(--destructive))' : 'hsl(var(--accent))' }
    ];
  }, [totalCalories, calorieGoal]);

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

  const handleSaveProfile = () => {
    setPhysicalProfile(parseFloat(profileForm.height) || 170, parseFloat(profileForm.weight) || 70);
    setIsProfileDialogOpen(false);
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
      <header className="w-full max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-card shadow-sm border border-transparent hover:border-border">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="bg-sky-500 text-white p-2.5 rounded-xl shadow-lg shadow-sky-200 dark:shadow-sky-900/20 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-primary tracking-tight">Health Dashboard</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Wellness & Body Metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsProfileDialogOpen(true)}
            className="h-12 rounded-xl px-4 gap-2 border-primary/20 hover:bg-primary/5"
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">Body Profile</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsGoalDialogOpen(true)}
            className="h-12 rounded-xl px-4 gap-2 border-primary/20 hover:bg-primary/5"
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Set Targets</span>
          </Button>
          <Button onClick={() => setIsDietDialogOpen(true)} className="h-12 rounded-xl px-6 gap-2 bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-200 dark:shadow-sky-900/20">
            <Plus className="w-5 h-5" />
            Log Meal
          </Button>
        </div>
      </header>

      <main className="w-full max-w-6xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Physical Stats / BMI Card */}
          <Card className="lg:col-span-4 shadow-2xl border-border bg-card/80 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-6">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-black text-primary">Body Composition</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-2xl text-center border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Height</p>
                  <p className="text-2xl font-black text-primary">{height} <span className="text-xs">cm</span></p>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl text-center border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Weight</p>
                  <p className="text-2xl font-black text-primary">{weight} <span className="text-xs">kg</span></p>
                </div>
              </div>

              <div className="flex flex-col items-center py-4 relative">
                <div className={cn(
                  "w-32 h-32 rounded-full flex flex-col items-center justify-center border-8 transition-colors duration-700",
                  bmiStatus.bg,
                  bmiStatus.color.replace('text-', 'border-')
                )}>
                  <span className="text-3xl font-black">{bmi}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">BMI</span>
                </div>
                <div className={cn(
                  "mt-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em]",
                  bmiStatus.bg,
                  bmiStatus.color
                )}>
                  {bmiStatus.label}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Target className="w-3 h-3" /> Recommended Daily Calorie
                </p>
                <div className="space-y-2">
                  {recommendedGoals.map(g => (
                    <div 
                      key={g.name} 
                      className="group flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 transition-colors rounded-xl cursor-pointer border border-transparent hover:border-border"
                      onClick={() => setCalorieGoal(g.value)}
                    >
                      <span className="text-xs font-bold text-primary">{g.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black">{g.value}</span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">kcal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calorie Goal & Chart */}
          <Card className="lg:col-span-8 shadow-2xl border-border bg-card/80 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-lg font-black text-emerald-900 dark:text-emerald-100">Daily Calorie Consumption</CardTitle>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{totalCalories}</span>
                  <span className="text-xs font-bold text-muted-foreground ml-1">/ {calorieGoal} kcal</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Progress value={calorieProgress} className="h-3 bg-emerald-100 dark:bg-emerald-900/30" />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-center">
                  {Math.round(calorieProgress)}% OF ENERGY BUDGET
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px]">
              <div className="w-full h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calorieChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {calorieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Meal Breakdown</p>
                <ScrollArea className="flex-1 pr-4">
                  {todayDiet.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
                      <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/30">
                        <Apple className="w-6 h-6" />
                      </div>
                      <p className="text-muted-foreground text-sm font-medium">Log your meals to visualize intake breakdown.</p>
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
              </div>
            </CardContent>
          </Card>

          {/* Hydration Card */}
          <Card className="lg:col-span-12 shadow-2xl border-border bg-card/80 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-sky-50/50 dark:bg-sky-900/10 border-b pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-sky-600" />
                  <CardTitle className="text-lg font-black text-sky-900 dark:text-sky-100">Daily Hydration Log</CardTitle>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-sky-700 dark:text-sky-400">{totalWater}</span>
                  <span className="text-xs font-bold text-muted-foreground ml-1">/ {waterGoal} ml</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {[200, 250, 400, 500, 750, 1000].map(amount => (
                  <Button 
                    key={amount}
                    variant="outline"
                    onClick={() => addWaterEntry(amount)}
                    className="h-20 flex flex-col gap-1 rounded-2xl border-sky-100 hover:bg-sky-50 dark:border-sky-800 dark:hover:bg-sky-900/20 shadow-sm"
                  >
                    <span className="text-lg font-black">{amount}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ML</span>
                  </Button>
                ))}
              </div>
              
              {todayWater.length > 0 && (
                <div className="mt-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Recent Logs</p>
                  <div className="flex flex-wrap gap-3">
                    {todayWater.sort((a,b) => b.createdAt - a.createdAt).slice(0, 8).map(log => (
                      <div key={log.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-transparent hover:border-sky-200 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
                          <Droplets className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black text-primary">+{log.amount}ml</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteWaterEntry(log.id)}
                          className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Goal Settings Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary tracking-tight">Health Targets</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest">Personalize your daily health limits</DialogDescription>
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

      {/* Profile Settings Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary tracking-tight">Body Profile</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest">Input your data for BMI calculation</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Height (cm)</UILabel>
              <Input 
                type="number"
                value={profileForm.height}
                onChange={e => setProfileForm(prev => ({ ...prev, height: e.target.value }))}
                className="h-12 rounded-xl bg-muted/30 border-transparent text-lg font-black"
              />
            </div>
            <div className="space-y-2">
              <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Weight (kg)</UILabel>
              <Input 
                type="number"
                value={profileForm.weight}
                onChange={e => setProfileForm(prev => ({ ...prev, weight: e.target.value }))}
                className="h-12 rounded-xl bg-muted/30 border-transparent text-lg font-black"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveProfile} className="w-full h-12 rounded-xl font-bold bg-primary shadow-xl shadow-primary/20">
              Save Profile
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
                  className="h-12 rounded-xl bg-muted/20 border-transparent font-bold"
                />
              </div>
              <div className="space-y-2">
                <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Meal Type</UILabel>
                <Select value={dietForm.mealType} onValueChange={val => setDietForm(prev => ({ ...prev, mealType: val }))}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-transparent capitalize font-bold">
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
