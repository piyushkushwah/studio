"use client";

import { useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Clock, Zap, Coffee, History } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function TimeTrackingPage() {
  const { sessions, isInitialized } = useTasks();

  const totalFocusTime = useMemo(() => {
    return sessions
      .filter(s => s.type === 'work')
      .reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [sessions]);

  const dailySessions = useMemo(() => {
    const grouped: Record<string, typeof sessions> = {};
    sessions.forEach(s => {
      if (!grouped[s.date]) grouped[s.date] = [];
      grouped[s.date].push(s);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [sessions]);

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
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-5xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="bg-primary text-white p-2 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-primary truncate">Time Tracking</h1>
        </div>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Total Deep Work</CardDescription>
              <CardTitle className="text-2xl font-bold text-primary flex items-baseline gap-1">
                {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Total Sessions</CardDescription>
              <CardTitle className="text-2xl font-bold text-accent">
                {sessions.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Work vs Break Ratio</CardDescription>
              <CardTitle className="text-2xl font-bold">
                {sessions.filter(s => s.type === 'work').length}:{sessions.filter(s => s.type === 'short').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-xl shadow-primary/5 border-white/40 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Activity Log</CardTitle>
            </div>
            <CardDescription>A chronological record of your Pomodoro sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="bg-muted p-4 rounded-full">
                  <Clock className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground font-medium">No sessions logged yet. Start a timer!</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-8">
                  {dailySessions.map(([date, daySessions]) => (
                    <div key={date} className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-primary/40 border-b pb-2">
                        {format(parseISO(date), 'EEEE, MMMM do')}
                      </h4>
                      <div className="grid gap-3">
                        {daySessions.map((session) => (
                          <div 
                            key={session.id} 
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-white/50 shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2 rounded-lg",
                                session.type === 'work' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                              )}>
                                {session.type === 'work' ? <Zap className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-bold text-sm">
                                  {session.type === 'work' ? 'Focus Session' : 'Short Break'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Started at {format(session.startTime, 'h:mm a')}
                                </p>
                              </div>
                            </div>
                            <span className="font-black text-sm text-primary">
                              {session.durationMinutes}m
                            </span>
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
    </div>
  );
}
