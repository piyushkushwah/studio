"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
  Settings,
  Scale,
  User,
  Activity,
  Target,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Info,
  Leaf
} from "lucide-react";
import Link from "next/link";
import { format, parseISO, addDays, subDays, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const VEG_DIET_OPTIONS = [
  // Meals (Lunch/Dinner)
  { name: "Dal Tadka (1 bowl)", calories: 150, category: "meals" },
  { name: "Paneer Tikka (100g)", calories: 250, category: "meals" },
  { name: "Mixed Veg Curry (1 bowl)", calories: 120, category: "meals" },
  { name: "Roti (1 piece)", calories: 85, category: "meals" },
  { name: "Brown Rice (1 cup)", calories: 215, category: "meals" },
  { name: "Chana Masala (1 bowl)", calories: 280, category: "meals" },
  { name: "Soya Chunks Curry (1 bowl)", calories: 180, category: "meals" },
  { name: "Tofu Stir Fry (100g)", calories: 160, category: "meals" },
  { name: "Lentil Soup (1 bowl)", calories: 180, category: "meals" },
  { name: "Quinoa (1 cup cooked)", calories: 220, category: "meals" },
  { name: "Palak Paneer (1 bowl)", calories: 240, category: "meals" },
  { name: "Vegetable Pulao (1 cup)", calories: 190, category: "meals" },
  
  // Snacks
  { name: "Moong Dal Sprouts (1 bowl)", calories: 100, category: "snacks" },
  { name: "Greek Yogurt (1 cup)", calories: 100, category: "snacks" },
  { name: "Mixed Vegetable Salad", calories: 50, category: "snacks" },
  { name: "Chickpea Salad (1 cup)", calories: 210, category: "snacks" },
  { name: "Almonds (10 pieces)", calories: 70, category: "snacks" },
  { name: "Walnuts (4 pieces)", calories: 100, category: "snacks" },
  { name: "Banana (Medium)", calories: 105, category: "snacks" },
  { name: "Apple (Medium)", calories: 95, category: "snacks" },
  { name: "Peanut Butter (1 tbsp)", calories: 90, category: "snacks" },
  { name: "Sweet Potato (100g)", calories: 90, category: "snacks" },
  { name: "Roasted Makhana (1 cup)", calories: 110, category: "snacks" },
  { name: "Hummus with Carrot", calories: 120, category: "snacks" },
  
  // Breakfast
  { name: "Oats with Milk (1 bowl)", calories: 200, category: "breakfast" },
  { name: "Vegetable Poha (1 bowl)", calories: 180, category: "breakfast" },
  { name: "Upma (1 bowl)", calories: 190, category: "breakfast" },
  { name: "Idli (2 pieces)", calories: 120, category: "breakfast" },
  { name: "Whole Grain Toast (2)", calories: 140, category: "breakfast" },
  { name: "Chia Seed Pudding", calories: 150, category: "breakfast" },
];

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

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDietDialogOpen, setIsDietDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
  const dateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);
  const isToday = useMemo(() => isSameDay(selectedDate, new Date()), [selectedDate]);

  const [dietForm, setDietForm] = useState({
    name: "",
    calories: "",
    mealType: "breakfast" as any,
    date: dateStr
  });

  const [goalForm, setGoalForm] = useState({
    water: waterGoal.toString(),
    calorie: calorieGoal.toString()
  });

  const [profileForm, setProfileForm] = useState({
    height: height.toString(),
    weight: weight.toString()
  });

  const selectedDiet = useMemo(() => diet.filter(d => d.date === dateStr), [diet, dateStr]);
  const selectedWater = useMemo(() => water.filter(w => w.date === dateStr), [water, dateStr]);

  const totalCalories = useMemo(() => selectedDiet.reduce((sum, d) => sum + d.calories, 0), [selectedDiet]);
  const totalWater = useMemo(() => selectedWater.reduce((sum, w) => sum + w.amount, 0), [selectedWater]);

  const waterProgress = Math.min((totalWater / waterGoal) * 100, 100);
  const calorieProgress = Math.min((totalCalories / calorieGoal) * 100, 100);

  const bmi = useMemo(() => {
    if (!height || !weight) return 0;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }, [height, weight]);

  const idealWeight = useMemo(() => {
    if (!height) return 0;
    const heightInMeters = height / 100;
    return Math.round(22 * (heightInMeters * heightInMeters));
  }, [height]);

  const weightDifference = useMemo(() => {
    if (!weight || !idealWeight) return 0;
    return weight - idealWeight;
  }, [weight, idealWeight]);

  const bmiStatus = useMemo(() => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500", bg: "bg-blue-500/10" };
    if (bmi < 25) return { label: "Healthy", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (bmi < 30) return { label: "Overweight", color: "text-orange-500", bg: "bg-orange-500/10" };
    return { label: "Obese", color: "text-destructive", bg: "bg-destructive/10" };
  }, [bmi]);

  const bmr = useMemo(() => {
    if (!height || !weight) return 2000;
    return Math.round((10 * weight) + (6.25 * height) - (5 * 30) + 5); 
  }, [height, weight]);

  const recommendedGoals = useMemo(() => {
    const maintenance = bmr * 1.375;
    return [
      { name: "Fat Loss", value: Math.round(maintenance - 500), color: "hsl(var(--destructive))" },
      { name: "Maintain", value: Math.round(maintenance), color: "hsl(var(--primary))" },
      { name: "Muscle Gain", value: Math.round(maintenance + 300), color: "hsl(var(--accent))" },
    ];
  }, [bmr]);

  const calorieChartData = useMemo(() => {
    return [
      { name: 'Target', value: calorieGoal, fill: 'hsl(var(--primary))' },
      { name: 'Current', value: totalCalories, fill: totalCalories > calorieGoal ? 'hsl(var(--destructive))' : 'hsl(var(--emerald-500))' }
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
    setDietForm({ name: "", calories: "", mealType: "breakfast", date: dateStr });
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
    <div className="w-full bg-background p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-xl text-sky-600 hover:bg-sky-50/50 hover:text-sky-600 transition-colors">
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

        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-2xl border">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSelectedDate(prev => subDays(prev, 1))}
            className="h-9 w-9 rounded-xl hover:bg-background shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 text-sky-600" />
          </Button>
          <div className="flex flex-col items-center px-4 min-w-[120px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 leading-none">
              {isToday ? "Today" : format(selectedDate, "EEEE")}
            </span>
            <span className="text-sm font-black text-primary">
              {format(selectedDate, "MMM d, yyyy")}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSelectedDate(prev => addDays(prev, 1))}
            className="h-9 w-9 rounded-xl hover:bg-background shadow-sm"
          >
            <ChevronRight className="w-4 h-4 text-sky-600" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsProfileDialogOpen(true)}
            className="h-12 rounded-xl px-4 gap-2 border-primary/20 hover:bg-sky-50 transition-colors hover:text-sky-600"
          >
            <User className="w-5 h-5 text-sky-500" />
            <span className="hidden sm:inline">Body Profile</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsGoalDialogOpen(true)}
            className="h-12 rounded-xl px-4 gap-2 border-primary/20 hover:bg-muted/50 transition-colors"
          >
            <Settings className="w-5 h-5 text-slate-500" />
            <span className="hidden sm:inline">Set Targets</span>
          </Button>
          <Button onClick={() => setIsDietDialogOpen(true)} className="h-12 rounded-xl px-6 gap-2 bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-200 dark:shadow-sky-900/20">
            <Plus className="w-5 h-5" />
            Log Meal
          </Button>
        </div>
      </header>

      <main className="w-full max-w-7xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-4 shadow-2xl border-border bg-card/80 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-6">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-sky-600" />
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

              <div className="grid grid-cols-1 gap-3 p-4 bg-sky-50/50 rounded-2xl border border-sky-100">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-700 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Ideal Weight
                  </p>
                  <span className="text-sm font-black text-sky-800">{idealWeight} kg</span>
                </div>
                {weightDifference > 0 && (
                  <div className="flex items-center justify-between border-t border-sky-100 pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-700 flex items-center gap-2">
                      <TrendingDown className="w-3 h-3" /> Weight to Reduce
                    </p>
                    <span className="text-sm font-black text-orange-800">{weightDifference.toFixed(1)} kg</span>
                  </div>
                )}
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

          <Card className="lg:col-span-8 shadow-2xl border-border bg-card/80 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600" />
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
                  {selectedDiet.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
                      <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/30">
                        <Apple className="w-6 h-6" />
                      </div>
                      <p className="text-muted-foreground text-sm font-medium">No meals logged for this date.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDiet.sort((a,b) => b.createdAt - a.createdAt).map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl group border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              entry.mealType === 'breakfast' ? "bg-amber-100 text-amber-600" : 
                              entry.mealType === 'snack' ? "bg-sky-100 text-sky-600" : 
                              "bg-emerald-100 text-emerald-600"
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
                              className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
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

          <Card className="lg:col-span-4 shadow-2xl border-border bg-card/80 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b pb-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg font-black text-primary">Veg Nutrition Guide</CardTitle>
              </div>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Healthy calorie references</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="meals" className="w-full">
                <TabsList className="w-full grid grid-cols-3 h-12 bg-muted/50 rounded-none border-b border-border/50">
                  <TabsTrigger value="meals" className="text-[10px] font-black uppercase tracking-widest data-[state=active]:text-emerald-600">Meals</TabsTrigger>
                  <TabsTrigger value="snacks" className="text-[10px] font-black uppercase tracking-widest data-[state=active]:text-emerald-600">Snacks</TabsTrigger>
                  <TabsTrigger value="breakfast" className="text-[10px] font-black uppercase tracking-widest data-[state=active]:text-emerald-600">Breakfast</TabsTrigger>
                </TabsList>
                
                {["meals", "snacks", "breakfast"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="m-0">
                    <ScrollArea className="h-[350px]">
                      <div className="p-4 space-y-2">
                        {VEG_DIET_OPTIONS.filter(o => o.category === tab).map((option, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-emerald-100 group">
                            <span className="text-xs font-bold text-primary group-hover:text-emerald-700 transition-colors">{option.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-emerald-600">{option.calories}</span>
                              <span className="text-[9px] font-black uppercase text-muted-foreground">kcal</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
              <div className="p-4 bg-muted/20 border-t flex items-center gap-3">
                <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-[9px] font-bold text-muted-foreground leading-tight">These are standard average values. Actual calories may vary based on portion size and preparation method.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-8 shadow-2xl border-border bg-card/80 backdrop-blur-sm rounded-[2rem] overflow-hidden">
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
                    onClick={() => addWaterEntry(amount, dateStr)}
                    className="h-20 flex flex-col gap-1 rounded-2xl border-sky-100 hover:bg-sky-50 dark:border-sky-800 dark:hover:bg-sky-900/20 shadow-sm transition-all active:scale-95"
                  >
                    <span className="text-lg font-black text-sky-600">{amount}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ML</span>
                  </Button>
                ))}
              </div>
              
              {selectedWater.length > 0 && (
                <div className="mt-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Recent Logs for {format(selectedDate, "MMM d")}</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedWater.sort((a,b) => b.createdAt - a.createdAt).slice(0, 12).map(log => (
                      <div key={log.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-transparent hover:border-sky-200 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
                          <Droplets className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black text-sky-700">+{log.amount}ml</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteWaterEntry(log.id)}
                          className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
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

      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary tracking-tight">Health Targets</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest">Personalize your daily health limits</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Water Goal (ml)</Label>
              <Input 
                type="number"
                value={goalForm.water}
                onChange={e => setGoalForm(prev => ({ ...prev, water: e.target.value }))}
                className="h-12 rounded-xl bg-muted/30 border-transparent text-lg font-black"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Calorie Target (kcal)</Label>
              <Input 
                type="number"
                value={goalForm.calorie}
                onChange={e => setGoalForm(prev => ({ ...prev, calorie: e.target.value }))}
                className="h-12 rounded-xl bg-muted/30 border-transparent text-lg font-black"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveGoals} className="w-full h-12 rounded-xl font-black bg-primary shadow-xl shadow-primary/20">
              Update Goals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary tracking-tight">Body Profile</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest">Input your data for BMI calculation</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Height (cm)</Label>
              <Input 
                type="number"
                value={profileForm.height}
                onChange={e => setProfileForm(prev => ({ ...prev, height: e.target.value }))}
                className="h-12 rounded-xl bg-muted/30 border-transparent text-lg font-black"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Weight (kg)</Label>
              <Input 
                type="number"
                value={profileForm.weight}
                onChange={e => setProfileForm(prev => ({ ...prev, weight: e.target.value }))}
                className="h-12 rounded-xl bg-muted/30 border-transparent text-lg font-black"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveProfile} className="w-full h-12 rounded-xl font-black bg-primary shadow-xl shadow-primary/20">
              Save Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDietDialogOpen} onOpenChange={setIsDietDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary tracking-tight">Record Nutrition</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest">Track your fuel for {format(selectedDate, "MMM d")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Food / Drink Name</Label>
              <Input 
                id="name"
                value={dietForm.name}
                onChange={e => setDietForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Avocado Toast"
                className="h-12 rounded-xl bg-muted/30 border-transparent font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Energy (kcal)</Label>
                <Input 
                  type="number"
                  value={dietForm.calories}
                  onChange={e => setDietForm(prev => ({ ...prev, calories: e.target.value }))}
                  placeholder="0"
                  className="h-12 rounded-xl bg-muted/20 border-transparent font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Meal Type</Label>
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
            <div className="space-y-2">
              <Label htmlFor="diet-date" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Date</Label>
              <Input 
                id="diet-date"
                type="date"
                value={dietForm.date}
                onChange={e => setDietForm(prev => ({ ...prev, date: e.target.value }))}
                className="h-12 rounded-xl bg-muted/20 border-transparent font-bold"
              />
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
