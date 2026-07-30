"use client";

import { useMemo, useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { ArrowLeft, Clock, Zap, Coffee, History, Plus, Pencil, Trash2, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Session } from "@/lib/types";

export default function TimeTrackingPage() {
  const { sessions, isInitialized, addSession, updateSession, deleteSession } = useTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  
  const [formData, setFormData] = useState({
    duration: "25",
    date: format(new Date(), "yyyy-MM-dd"),
    note: "",
    type: "manual" as "work" | "short" | "manual"
  });

  const totalFocusTime = useMemo(() => {
    return sessions
      .filter(s => s.type === 'work' || s.type === 'manual')
      .reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [sessions]);

  const totalBreakTime = useMemo(() => {
    return sessions
      .filter(s => s.type === 'short')
      .reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [sessions]);

  const efficiency = useMemo(() => {
    const total = totalFocusTime + totalBreakTime;
    if (total === 0) return 0;
    return Math.round((totalFocusTime / total) * 100);
  }, [totalFocusTime, totalBreakTime]);

  const dailySessions = useMemo(() => {
    const grouped: Record<string, typeof sessions> = {};
    sessions.forEach(s => {
      if (!grouped[s.date]) grouped[s.date] = [];
      grouped[s.date].push(s);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [sessions]);

  const handleOpenDialog = (session: Session | null = null) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        duration: session.durationMinutes.toString(),
        date: session.date,
        note: session.note || "",
        type: session.type
      });
    } else {
      setEditingSession(null);
      setFormData({
        duration: "25",
        date: format(new Date(), "yyyy-MM-dd"),
        note: "",
        type: "manual"
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const duration = parseInt(formData.duration) || 0;
    if (editingSession) {
      updateSession(editingSession.id, {
        durationMinutes: duration,
        date: formData.date,
        note: formData.note,
        type: formData.type
      });
    } else {
      addSession(duration, formData.type, formData.note, formData.date);
    }
    setIsDialogOpen(false);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Loading session logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-7xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-xl text-blue-600 hover:bg-muted/50 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="bg-blue-600 text-primary-foreground p-2 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-primary truncate">Manual & Automatic Time Logs</h1>
        </div>
        <Button onClick={() => handleOpenDialog()} className="rounded-xl gap-2 shadow-lg bg-blue-600 hover:bg-blue-700 shadow-blue-200">
          <Plus className="w-4 h-4" />
          Log Manual Time
        </Button>
      </header>

      <main className="w-full max-w-7xl space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase tracking-widest text-[10px]">Total Deep Work</CardDescription>
              <CardTitle className="text-2xl font-black text-blue-600 flex items-baseline gap-1">
                {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase tracking-widest text-[10px]">Total Break Time</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-600 flex items-baseline gap-1">
                {Math.floor(totalBreakTime / 60)}h {totalBreakTime % 60}m
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase tracking-widest text-[10px]">Focus Intensity</CardDescription>
              <CardTitle className="text-2xl font-black text-orange-600 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {efficiency}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase tracking-widest text-[10px]">Logged Sessions</CardDescription>
              <CardTitle className="text-2xl font-black text-blue-600">
                {sessions.length}
              </CardTitle>
            </CardHeader>
          </div>
        </div>

        <Card className="shadow-xl shadow-blue-100/50 border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Activity Log (Synced to Database)</CardTitle>
            </div>
            <CardDescription>A chronological record of your productivity and rest sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="bg-muted p-4 rounded-full">
                  <Clock className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground font-medium">No sessions logged yet. Start a timer or log manually!</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  {dailySessions.map(([date, daySessions]) => (
                    <div key={date} className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/40 border-b pb-2">
                        {format(parseISO(date), 'EEEE, MMMM do')}
                      </h4>
                      <div className="grid gap-3">
                        {daySessions.map((session) => (
                          <div 
                            key={session.id} 
                            className="group flex flex-col p-4 bg-card rounded-xl border border-border shadow-sm transition-all hover:border-blue-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  session.type === 'work' || session.type === 'manual' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                                )}>
                                  {session.type === 'work' || session.type === 'manual' ? <Zap className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                                </div>
                                <div>
                                  <p className="font-bold text-sm">
                                    {session.type === 'work' ? 'Focus Session' : session.type === 'manual' ? 'Manual Entry' : 'Short Break'}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-medium">
                                    {session.type === 'manual' ? 'Manual record' : `Started at ${format(session.startTime, 'h:mm a')}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={cn(
                                  "font-black text-sm",
                                  session.type === 'short' ? "text-emerald-600" : "text-blue-600"
                                )}>
                                  {session.durationMinutes}m
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-blue-50 hover:text-blue-600" onClick={() => handleOpenDialog(session)}>
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteSession(session.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {session.note && (
                              <p className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md italic">
                                "{session.note}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit Session" : "Log Manual Time"}</DialogTitle>
            <DialogDescription>Record your deep work or break sessions manually. All data is saved to your cloud database.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <UILabel htmlFor="duration">Duration (minutes)</UILabel>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="25"
                className="h-12 rounded-xl bg-muted/30 border-transparent font-bold"
              />
            </div>
            <div className="grid gap-2">
              <UILabel htmlFor="date">Date</UILabel>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  className="h-12 pl-10 rounded-xl bg-muted/30 border-transparent"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <UILabel htmlFor="note">Notes (optional)</UILabel>
              <Input
                id="note"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="What did you focus on?"
                className="h-12 rounded-xl bg-muted/30 border-transparent"
              />
            </div>
            <div className="grid gap-2">
              <UILabel>Type</UILabel>
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant={formData.type === 'manual' || formData.type === 'work' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-12 rounded-xl font-bold"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'manual' }))}
                >
                  Work
                </Button>
                <Button 
                  type="button"
                  variant={formData.type === 'short' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-12 rounded-xl font-bold"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'short' }))}
                >
                  Break
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3">
            <Button variant="ghost" className="h-12 rounded-xl flex-1 hover:bg-muted/50" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.duration || parseInt(formData.duration) <= 0} className="h-12 rounded-xl flex-1 bg-blue-600 hover:bg-blue-700">
              {editingSession ? "Update Log" : "Add Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
