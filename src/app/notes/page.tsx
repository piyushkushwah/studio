"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  StickyNote, 
  Trash2, 
  Pencil, 
  Clock, 
  LayoutGrid,
  LayoutList
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Note } from "@/lib/types";

const NOTE_COLORS = [
  "bg-card border-border",
  "bg-yellow-100/10 border-yellow-200/20 text-yellow-900 dark:text-yellow-100",
  "bg-blue-100/10 border-blue-200/20 text-blue-900 dark:text-blue-100",
  "bg-green-100/10 border-green-200/20 text-green-900 dark:text-green-100",
  "bg-purple-100/10 border-purple-200/20 text-purple-900 dark:text-purple-100",
  "bg-pink-100/10 border-pink-200/20 text-pink-900 dark:text-pink-100",
  "bg-orange-100/10 border-orange-200/20 text-orange-900 dark:text-orange-100",
];

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, isInitialized } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    color: NOTE_COLORS[0]
  });

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(n => 
      n.title?.toLowerCase().includes(query) || 
      n.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const handleOpenDialog = (note: Note | null = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title || "",
        content: note.content,
        color: note.color || NOTE_COLORS[0]
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: "",
        content: "",
        color: NOTE_COLORS[0]
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.content.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, {
        title: formData.title,
        content: formData.content,
        color: formData.color
      });
    } else {
      addNote({
        title: formData.title,
        content: formData.content,
        color: formData.color
      });
    }
    setIsDialogOpen(false);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest font-black">Syncing Thoughts...</p>
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
          <div className="bg-primary text-primary-foreground p-2.5 rounded-xl shadow-lg shadow-primary/20 shrink-0">
            <StickyNote className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-primary tracking-tight">Quick Notes</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Thought Repository</p>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-3 md:max-w-md">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search your notes..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-card rounded-xl shadow-sm border-border focus:border-primary/20"
            />
          </div>
          <div className="flex bg-card p-1 rounded-xl shadow-sm border border-border">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewMode("grid")}
              className={cn("h-9 w-9 rounded-lg", viewMode === "grid" ? "bg-primary/5 text-primary" : "text-muted-foreground")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewMode("list")}
              className={cn("h-9 w-9 rounded-lg", viewMode === "list" ? "bg-primary/5 text-primary" : "text-muted-foreground")}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => handleOpenDialog()} className="h-11 rounded-xl px-6 gap-2 shadow-xl shadow-primary/20">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Note</span>
          </Button>
        </div>
      </header>

      <main className="w-full max-w-7xl flex-1">
        {notes.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-6">
            <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary/20 border-2 border-dashed border-primary/10">
              <StickyNote className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-primary">Your Mind is Clear</h3>
              <p className="text-muted-foreground text-sm font-medium max-w-[280px]">Start capturing ideas, links, and snippets to keep your workspace organized.</p>
            </div>
            <Button onClick={() => handleOpenDialog()} size="lg" className="rounded-2xl px-8 shadow-xl shadow-primary/10">
              Create Your First Note
            </Button>
          </div>
        ) : (
          <div className={cn(
            "gap-6",
            viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col"
          )}>
            {filteredNotes.map((note) => (
              <Card 
                key={note.id} 
                className={cn(
                  "group relative flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 rounded-[1.5rem] overflow-hidden border-border",
                  note.color || NOTE_COLORS[0]
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-bold text-primary truncate pr-8">
                      {note.title || "Untitled Note"}
                    </CardTitle>
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5" onClick={() => handleOpenDialog(note)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteNote(note.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                    <Clock className="w-3 h-3" />
                    {format(note.updatedAt, "MMM d, h:mm a")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-6">
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap line-clamp-6">
                    {note.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
          <div className={cn("p-8 h-full transition-colors duration-500", formData.color)}>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-primary tracking-tight">
                {editingNote ? "Refine Thought" : "Capture Idea"}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                All changes sync instantly to cloud
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Note Title (optional)"
                  className="bg-card border-border h-12 text-lg font-bold placeholder:text-primary/20 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="What's on your mind?..."
                  className="bg-card border-border min-h-[250px] resize-none text-base font-medium placeholder:text-primary/20 rounded-xl p-4 leading-relaxed"
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  {NOTE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        color.split(' ')[0],
                        formData.color === color ? "ring-2 ring-primary ring-offset-2 scale-110" : "border-border opacity-80 hover:opacity-100"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 flex gap-3">
              <Button variant="ghost" className="rounded-xl px-6 h-12 font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.content.trim()} className="rounded-xl px-8 h-12 shadow-xl shadow-primary/20">
                {editingNote ? "Update Note" : "Save Note"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
