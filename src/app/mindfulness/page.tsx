
"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  Sparkles, 
  Trash2, 
  Heart, 
  MessageSquare, 
  Zap, 
  Sun,
  Calendar as CalendarIcon,
  Search,
  Quote,
  Pencil,
  BookOpen,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { GrowthNote, GrowthNoteType } from "@/lib/types";

const NOTE_TYPES: { value: GrowthNoteType; label: string; icon: any; color: string }[] = [
  { value: "reflection", label: "चिंतन (Reflection)", icon: MessageSquare, color: "text-blue-500 bg-blue-500/10" },
  { value: "gratitude", label: "आभार (Gratitude)", icon: Heart, color: "text-pink-500 bg-pink-500/10" },
  { value: "affirmation", label: "सकारात्मक विचार (Affirmation)", icon: Sun, color: "text-orange-500 bg-orange-500/10" },
  { value: "lesson", label: "जीवन की सीख (Lesson)", icon: Zap, color: "text-emerald-500 bg-emerald-500/10" },
];

export default function MindfulnessPage() {
  const { growthNotes, addGrowthNote, updateGrowthNote, deleteGrowthNote, isInitialized } = useTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNote, setEditingNote] = useState<GrowthNote | null>(null);
  
  const [formData, setFormData] = useState({
    content: "",
    source: "",
    type: "reflection" as GrowthNoteType,
    date: format(new Date(), "yyyy-MM-dd")
  });

  const filteredNotes = useMemo(() => {
    let filtered = growthNotes;
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.source?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [growthNotes, searchQuery]);

  const stats = useMemo(() => {
    const counts = { reflection: 0, gratitude: 0, affirmation: 0, lesson: 0 };
    growthNotes.forEach(n => {
      if (counts[n.type] !== undefined) counts[n.type]++;
    });
    return counts;
  }, [growthNotes]);

  const handleOpenDialog = (note: GrowthNote | null = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        content: note.content,
        source: note.source || "",
        type: note.type,
        date: note.date
      });
    } else {
      setEditingNote(null);
      setFormData({
        content: "",
        source: "",
        type: "reflection",
        date: format(new Date(), "yyyy-MM-dd")
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.content.trim()) return;

    const entryData = {
      content: formData.content,
      source: formData.source.trim() || undefined,
      type: formData.type,
      date: formData.date
    };

    if (editingNote) {
      updateGrowthNote(editingNote.id, entryData);
    } else {
      addGrowthNote(entryData);
    }
    setIsDialogOpen(false);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">Entering Sanctuary...</p>
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
          <div className="bg-purple-600 text-primary-foreground p-2.5 rounded-xl shadow-lg shadow-purple-200 dark:shadow-purple-900/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-primary tracking-tight">Adhyatmic Sanctuary</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Mindfulness & Personal Growth</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search reflections or gurus..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-12 w-64 rounded-xl bg-card border-border"
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="h-12 rounded-xl px-6 gap-2 bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200 dark:shadow-purple-900/20">
            <Plus className="w-5 h-5" />
            Add Reflection
          </Button>
        </div>
      </header>

      <main className="w-full max-w-6xl space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NOTE_TYPES.map(type => (
            <Card key={type.value} className="shadow-lg border-border bg-card/50 backdrop-blur-sm">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <div className={cn("p-2 rounded-lg", type.color)}>
                  <type.icon className="w-4 h-4" />
                </div>
                <span className="text-xl font-black text-primary">{(stats as any)[type.value]}</span>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{type.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8">
            {filteredNotes.length === 0 ? (
              <Card className="shadow-2xl border-border bg-card flex flex-col items-center justify-center text-center p-16 rounded-[2.5rem]">
                <div className="w-24 h-24 bg-muted rounded-[2.5rem] flex items-center justify-center text-muted-foreground/20 mb-8 border-2 border-dashed border-border">
                  <Quote className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-primary mb-2">A Clear Mind</h3>
                <p className="text-muted-foreground text-sm font-medium max-w-sm mb-8">Start recording your thoughts, gratitudes, and affirmations to build a more mindful and improved version of yourself.</p>
                <Button onClick={() => handleOpenDialog()} variant="outline" className="rounded-xl border-dashed">
                  Write Your First Reflection
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredNotes.map((note) => {
                  const typeConfig = NOTE_TYPES.find(t => t.value === note.type)!;
                  return (
                    <Card key={note.id} className="group overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-border bg-card/80 backdrop-blur-xl rounded-[2rem]">
                      <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl", typeConfig.color)}>
                              <typeConfig.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">{typeConfig.label}</p>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                <CalendarIcon className="w-3 h-3" />
                                {format(parseISO(note.date), "MMMM do, yyyy")}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleOpenDialog(note)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-destructive" onClick={() => deleteGrowthNote(note.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <p className="text-lg font-medium text-primary leading-relaxed whitespace-pre-wrap">
                            {note.content}
                          </p>
                          {note.source && (
                            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                              <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source:</span>
                              <span className="text-xs font-bold text-primary">{note.source}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="xl:col-span-4 space-y-8">
            <Card className="shadow-2xl border-border bg-card rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-purple-50/50 dark:bg-purple-900/10 border-b p-6">
                <CardTitle className="text-lg font-black text-purple-700 flex items-center gap-2">
                  <Quote className="w-5 h-5" />
                  Wisdom of the Day
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 italic text-muted-foreground text-sm leading-relaxed">
                "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself."
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary">— Rumi</p>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-border bg-card rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b p-6">
                <CardTitle className="text-lg font-black text-primary flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Growth Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <p className="text-xs text-muted-foreground">You have recorded <b>{growthNotes.length}</b> mindfulness entries. Consistency is the key to self-improvement.</p>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${Math.min((growthNotes.length / 100) * 100, 100)}%` }} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 text-center">Path to 100 Reflections</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <div className="p-8 space-y-8 bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-primary tracking-tight">
                {editingNote ? "Refine Reflection" : "Record Wisdom"}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                Self-improvement starts with a single thought
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Category (श्रेणी)</UILabel>
                  <Select value={formData.type} onValueChange={(val: any) => setFormData(prev => ({ ...prev, type: val }))}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-transparent font-bold capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value} className="capitalize">{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <UILabel htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Date (तारीख)</UILabel>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="h-12 rounded-xl bg-muted/30 border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <UILabel htmlFor="source" className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> Source (Guru / Book / Person)
                </UILabel>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="e.g. Bhagavad Gita, Swami Vivekananda"
                  className="h-12 rounded-xl bg-muted/30 border-transparent font-bold"
                />
              </div>

              <div className="space-y-2">
                <UILabel htmlFor="content" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Your Thoughts (विचार)</UILabel>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={
                    formData.type === 'gratitude' ? "What are you thankful for today?" :
                    formData.type === 'affirmation' ? "What is your daily mantra?" :
                    formData.type === 'lesson' ? "What did the day teach you?" :
                    "Reflect on your current state of mind..."
                  }
                  className="resize-none h-48 rounded-xl bg-muted/30 border-transparent focus:bg-card p-4 text-base font-medium leading-relaxed"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <Button variant="ghost" className="h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsDialogOpen(false)}>
                Discard
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!formData.content.trim()}
                className="h-12 px-8 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200 flex-1"
              >
                {editingNote ? "Save Refinement" : "Record Entry"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
