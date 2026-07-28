
"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  Plane, 
  Trash2, 
  MapPin, 
  Calendar as CalendarIcon,
  Wallet,
  CheckCircle2,
  ListTodo,
  Pencil,
  Compass,
  Mountain,
  Palmtree,
  Ship,
  X
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { TravelGoal } from "@/lib/types";

const TRAVEL_STATUSES = ["bucket-list", "planned", "completed"];

export default function TravelPage() {
  const { travelGoals, addTravelGoal, updateTravelGoal, deleteTravelGoal, isInitialized } = useTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<TravelGoal | null>(null);
  
  const [formData, setFormData] = useState({
    destination: "",
    plannedDate: "",
    budget: "",
    status: "bucket-list" as any,
    notes: "",
    packingItem: ""
  });

  const [packingItems, setPackingItems] = useState<string[]>([]);

  const stats = useMemo(() => {
    const total = travelGoals.length;
    const completed = travelGoals.filter(g => g.status === 'completed').length;
    const planned = travelGoals.filter(g => g.status === 'planned').length;
    return { total, completed, planned };
  }, [travelGoals]);

  const handleOpenDialog = (goal: TravelGoal | null = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        destination: goal.destination,
        plannedDate: goal.plannedDate || "",
        budget: goal.budget?.toString() || "",
        status: goal.status,
        notes: goal.notes || "",
        packingItem: ""
      });
      setPackingItems(goal.packingList || []);
    } else {
      setEditingGoal(null);
      setFormData({
        destination: "",
        plannedDate: "",
        budget: "",
        status: "bucket-list",
        notes: "",
        packingItem: ""
      });
      setPackingItems([]);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.destination.trim()) return;
    
    const goalData = {
      destination: formData.destination,
      plannedDate: formData.plannedDate || undefined,
      budget: parseFloat(formData.budget) || undefined,
      status: formData.status,
      notes: formData.notes,
      packingList: packingItems
    };

    if (editingGoal) {
      updateTravelGoal(editingGoal.id, goalData);
    } else {
      addTravelGoal(goalData);
    }
    
    setIsDialogOpen(false);
  };

  const addPackingItem = () => {
    if (formData.packingItem.trim()) {
      setPackingItems(prev => [...prev, formData.packingItem.trim()]);
      setFormData(prev => ({ ...prev, packingItem: "" }));
    }
  };

  const removePackingItem = (index: number) => {
    setPackingItems(prev => prev.filter((_, i) => i !== index));
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">Loading Travel Map...</p>
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
          <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-primary tracking-tight">Travel Tracker</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Bucket List & Trip Planner</p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()} className="h-12 rounded-xl px-6 gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20">
          <Plus className="w-5 h-5" />
          Add Destination
        </Button>
      </header>

      <main className="w-full max-w-6xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-2xl shadow-emerald-100 dark:shadow-emerald-950/20 border-border bg-card backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest text-emerald-700">Total Destinations</CardDescription>
              <CardTitle className="text-3xl font-black text-emerald-600 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                {stats.total}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-xl shadow-primary/5 border-border bg-card backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest">Trips Planned</CardDescription>
              <CardTitle className="text-3xl font-black text-primary flex items-center gap-2">
                <Plane className="w-6 h-6" />
                {stats.planned}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-xl shadow-primary/5 border-border bg-card backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest">Completed Journeys</CardDescription>
              <CardTitle className="text-3xl font-black text-primary flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                {stats.completed}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main List */}
          <div className="xl:col-span-8 space-y-6">
            {travelGoals.length === 0 ? (
              <Card className="shadow-2xl border-border bg-card flex flex-col items-center justify-center text-center p-12 rounded-[2.5rem]">
                <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center text-muted-foreground/30 mb-6">
                  <Mountain className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-primary mb-2">Adventure Awaits</h3>
                <p className="text-muted-foreground text-sm font-medium max-w-sm mb-8">Start your travel journal by adding destinations you dream of visiting or trips you're currently planning.</p>
                <Button onClick={() => handleOpenDialog()} variant="outline" className="rounded-xl border-dashed">
                  Add First Destination
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {travelGoals.map((goal) => (
                  <Card key={goal.id} className="group overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-border bg-card/80 backdrop-blur-sm rounded-[2rem]">
                    <div className={cn(
                      "h-2 w-full",
                      goal.status === 'completed' ? "bg-emerald-500" :
                      goal.status === 'planned' ? "bg-primary" :
                      "bg-orange-400"
                    )} />
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <CardTitle className="text-lg font-black text-primary">{goal.destination}</CardTitle>
                          </div>
                          <Badge variant="secondary" className="capitalize text-[8px] font-black tracking-[0.1em]">
                            {goal.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleOpenDialog(goal)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-destructive" onClick={() => deleteTravelGoal(goal.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-4 text-[10px] font-bold text-muted-foreground">
                        {goal.plannedDate && (
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3 h-3 text-primary" />
                            {format(parseISO(goal.plannedDate), "MMM yyyy")}
                          </div>
                        )}
                        {goal.budget && (
                          <div className="flex items-center gap-1.5">
                            <Wallet className="w-3 h-3 text-emerald-600" />
                            ${goal.budget.toLocaleString()}
                          </div>
                        )}
                        {goal.packingList && goal.packingList.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <ListTodo className="w-3 h-3 text-primary" />
                            {goal.packingList.length} Items
                          </div>
                        )}
                      </div>
                      {goal.notes && (
                        <p className="text-xs text-muted-foreground/80 italic line-clamp-2 leading-relaxed bg-muted/20 p-3 rounded-xl">
                          "{goal.notes}"
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats / Sidebar */}
          <div className="xl:col-span-4 space-y-8">
             <Card className="shadow-2xl border-border bg-card rounded-[2rem] overflow-hidden">
               <CardHeader className="bg-primary/5 border-b">
                 <CardTitle className="text-lg font-black text-primary flex items-center gap-2">
                   <Palmtree className="w-5 h-5" />
                   Dream Destinations
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <div className="space-y-4">
                    {travelGoals.filter(g => g.status === 'bucket-list').length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No bucket list items yet.</p>
                    ) : (
                      travelGoals.filter(g => g.status === 'bucket-list').slice(0, 5).map(g => (
                        <div key={g.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-transparent hover:border-border transition-colors">
                          <span className="text-sm font-bold text-primary">{g.destination}</span>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-black uppercase" onClick={() => updateTravelGoal(g.id, { status: 'planned' })}>
                            Plan Now
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
               </CardContent>
             </Card>

             <Card className="shadow-2xl border-border bg-card rounded-[2rem] overflow-hidden">
               <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b">
                 <CardTitle className="text-lg font-black text-emerald-700 flex items-center gap-2">
                   <Ship className="w-5 h-5" />
                   Trip Budgeting
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                 <div className="space-y-4">
                   {travelGoals.filter(g => g.status === 'planned' && g.budget).map(g => (
                     <div key={g.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-primary">{g.destination}</span>
                          <span className="text-emerald-600">${g.budget?.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[70%]" />
                        </div>
                     </div>
                   ))}
                   {travelGoals.filter(g => g.status === 'planned' && g.budget).length === 0 && (
                     <p className="text-xs text-muted-foreground text-center py-4">Add budget to planned trips.</p>
                   )}
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>
      </main>

      {/* Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-8 space-y-8 bg-card">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-primary tracking-tight">
                  {editingGoal ? "Update Journey" : "New Adventure"}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                  Plan your next big move
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <UILabel htmlFor="destination" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Destination Name</UILabel>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="e.g. Kyoto, Japan"
                    className="h-12 rounded-xl bg-muted/30 border-transparent text-lg font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Status</UILabel>
                    <Select value={formData.status} onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-transparent font-bold capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAVEL_STATUSES.map(status => (
                          <SelectItem key={status} value={status} className="capitalize">{status.replace('-', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <UILabel htmlFor="budget" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Budget ($)</UILabel>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="0.00"
                      className="h-12 rounded-xl bg-muted/30 border-transparent font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <UILabel htmlFor="plannedDate" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Target Date</UILabel>
                  <Input
                    id="plannedDate"
                    type="date"
                    value={formData.plannedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, plannedDate: e.target.value }))}
                    className="h-12 rounded-xl bg-muted/30 border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <UILabel htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Trip Notes</UILabel>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Bucket list reasons, sightseeing, food to try..."
                    className="resize-none h-24 rounded-xl bg-muted/30 border-transparent focus:bg-card p-4 text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Packing Essentials</UILabel>
                  <div className="flex gap-2">
                    <Input
                      value={formData.packingItem}
                      onChange={(e) => setFormData(prev => ({ ...prev, packingItem: e.target.value }))}
                      placeholder="Add item..."
                      className="h-10 rounded-xl bg-muted/30 border-transparent"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPackingItem())}
                    />
                    <Button type="button" size="icon" className="rounded-xl h-10 w-10 shrink-0" onClick={addPackingItem}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {packingItems.map((item, index) => (
                      <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1 rounded-lg flex items-center gap-1 group/badge bg-primary/5 hover:bg-primary/10 transition-colors">
                        <span className="text-[10px] font-bold">{item}</span>
                        <button onClick={() => removePackingItem(index)} className="text-muted-foreground hover:text-destructive opacity-40 group-hover/badge:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-3 pt-4">
                <Button variant="ghost" className="h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsDialogOpen(false)}>
                  Discard
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={!formData.destination.trim()}
                  className="h-12 px-8 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 flex-1"
                >
                  {editingGoal ? "Update Plan" : "Log Destination"}
                </Button>
              </DialogFooter>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
