"use client";

import { useState, useEffect, useCallback } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { LabelManager } from "@/components/label-manager";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { FocusPlayer } from "@/components/focus-player";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, getHours } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Quote,
  Flame,
  Sparkles,
  LogOut,
  Clock,
  BarChart2,
  Loader2,
  Moon,
  Sun
} from "lucide-react";
import Link from "next/link";
import { getRandomQuote } from "@/lib/quotes";
import { useToast } from "@/hooks/use-toast";
import { generateDailyBriefing } from "@/ai/flows/daily-briefing-flow";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const { tasks, streak } = useTasks();
  const { toast } = useToast();

  const [greeting, setGreeting] = useState("Hello");
  const [quote, setQuote] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dailyBriefing, setDailyBriefing] = useState<string | null>(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);

  useEffect(() => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    toast({ title: "Signed Out", description: "Successfully logged out." });
  };

  const fetchDailyBriefing = async () => {
    if (!user) return;
    setIsGeneratingBriefing(true);
    try {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const todayTasks = tasks.filter(t => t.dueDate === todayStr);
      const result = await generateDailyBriefing({
        userName: user.displayName?.split(' ')[0] || 'User',
        tasks: todayTasks.slice(0, 5).map(t => t.description),
        completedCount: todayTasks.filter(t => t.completed).length,
        streak: streak,
      });
      setDailyBriefing(result.briefing);
    } catch (error) {
      console.error("Briefing Failed", error);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const fetchNewQuote = useCallback(async () => {
    const newQuote = await getRandomQuote();
    setQuote(newQuote);
  }, []);

  useEffect(() => {
    const hour = getHours(new Date());
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    
    fetchNewQuote();
    const intervalId = setInterval(fetchNewQuote, 60000);
    return () => clearInterval(intervalId);
  }, [fetchNewQuote]);

  if (authLoading || !user) return null;

  return (
    <header className="w-full max-w-7xl flex flex-col gap-6 p-4 md:p-8 shrink-0">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="flex items-start gap-5">
          <Link href="/">
            <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-xl shadow-primary/20 shrink-0 hover:scale-105 transition-transform cursor-pointer mt-1">
              <CalendarIcon className="w-7 h-7" />
            </div>
          </Link>
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-3">
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary leading-tight whitespace-nowrap">
                {greeting}, {user.displayName?.split(' ')[0]}
              </h1>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-3 py-1 rounded-full text-xs font-black border border-orange-200 dark:border-orange-800/30 shrink-0 shadow-sm">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span className="uppercase tracking-wider">{streak} Day Streak</span>
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-col gap-1">
              {dailyBriefing ? (
                <div className="flex items-start gap-2 bg-primary/5 p-3 rounded-xl border border-primary/10 animate-in slide-in-from-left-2 max-w-md">
                  <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs font-bold text-primary/80 leading-relaxed italic pr-8">{dailyBriefing}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Quote className="w-3.5 h-3.5 text-accent shrink-0" />
                  {quote ? <p className="text-xs font-bold text-muted-foreground tracking-tight">{quote}</p> : <Skeleton className="h-3 w-[200px]" />}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover:bg-primary/10" 
                    onClick={fetchDailyBriefing}
                    disabled={isGeneratingBriefing}
                  >
                    {isGeneratingBriefing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <Sparkles className="w-3.5 h-3.5 text-primary opacity-60 hover:opacity-100" />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 xl:ml-auto">
          {/* Top Row: Focus Radio & Navigation Modules */}
          <div className="flex items-center gap-3">
            <FocusPlayer />
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-card border rounded-2xl shadow-sm h-14 w-fit">
              <LabelManager />
              <Link href="/time-tracking">
                <Button variant="ghost" className="flex flex-col items-center justify-center gap-0.5 h-11 w-12 rounded-xl hover:bg-primary/5 group" title="Time Log">
                  <Clock className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                  <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/60 leading-none">Logs</span>
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="ghost" className="flex flex-col items-center justify-center gap-0.5 h-11 w-12 rounded-xl hover:bg-primary/5 group" title="Analytics">
                  <BarChart2 className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                  <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/60 leading-none">Stats</span>
                </Button>
              </Link>
              <div className="w-px h-6 bg-border mx-1" />
              <Button 
                variant="ghost" 
                className="flex flex-col items-center justify-center gap-0.5 h-11 w-12 rounded-xl hover:bg-destructive/5 text-muted-foreground hover:text-destructive group" 
                onClick={handleLogout} 
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                <span className="text-[8px] font-black uppercase tracking-tighter text-current leading-none">Exit</span>
              </Button>
            </div>
          </div>

          {/* Bottom Row: Timers, Theme & Profile */}
          <div className="flex items-center gap-3">
            <PomodoroTimer />
            <div className="flex items-center gap-2 pl-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-12 w-12 rounded-2xl bg-white dark:bg-card border shadow-sm transition-all hover:border-primary/20">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Avatar className="h-12 w-12 border-2 border-background shadow-md ring-2 ring-primary/5">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                  {user.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
