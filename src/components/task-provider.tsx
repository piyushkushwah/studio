
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { Task, Label, Session, TaskContextType, CustomSong } from '@/lib/types';
import { format, subDays, isSameDay } from 'date-fns';
import { useUser } from '@/firebase';

const DEFAULT_LABELS: Label[] = [
  { id: '1', name: 'work', color: 'bg-blue-600 text-white hover:bg-blue-700' },
  { id: '2', name: 'personal', color: 'bg-purple-600 text-white hover:bg-purple-700' },
  { id: '3', name: 'shopping', color: 'bg-orange-500 text-white hover:bg-orange-600' },
  { id: '4', name: 'urgent', color: 'bg-red-600 text-white hover:bg-red-700' },
  { id: '5', name: 'other', color: 'bg-slate-600 text-white hover:bg-slate-700' },
];

const TIMER_CONFIG = {
  work: 25 * 60,
  short: 5 * 60,
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<Label[]>(DEFAULT_LABELS);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dailyGoals, setDailyGoals] = useState<Record<string, number>>({});
  const [customSongs, setCustomSongs] = useState<CustomSong[]>([]);
  
  const [workTimerLeft, setWorkTimerLeft] = useState(TIMER_CONFIG.work);
  const [breakTimerLeft, setBreakTimerLeft] = useState(TIMER_CONFIG.short);
  const [isWorkTimerActive, setWorkTimerActive] = useState(false);
  const [isBreakTimerActive, setBreakTimerActive] = useState(false);
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (authLoading) return;

    const storagePrefix = user ? `user_${user.uid}_` : 'guest_';
    
    try {
      const storedTasks = localStorage.getItem(`${storagePrefix}tasks`);
      const storedLabels = localStorage.getItem(`${storagePrefix}labels`);
      const storedSessions = localStorage.getItem(`${storagePrefix}sessions`);
      const storedPrefs = localStorage.getItem(`${storagePrefix}preferences`);

      if (storedTasks) setTasks(JSON.parse(storedTasks));
      if (storedLabels) setLabels(JSON.parse(storedLabels));
      else setLabels(DEFAULT_LABELS);
      
      if (storedSessions) setSessions(JSON.parse(storedSessions));
      
      if (storedPrefs) {
        const prefs = JSON.parse(storedPrefs);
        setDailyGoals(prefs.dailyGoals || {});
        setCustomSongs(prefs.customSongs || []);
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
    
    setIsInitialized(true);
  }, [user, authLoading]);

  // Save to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    const storagePrefix = user ? `user_${user.uid}_` : 'guest_';
    
    localStorage.setItem(`${storagePrefix}tasks`, JSON.stringify(tasks));
    localStorage.setItem(`${storagePrefix}labels`, JSON.stringify(labels));
    localStorage.setItem(`${storagePrefix}sessions`, JSON.stringify(sessions));
    localStorage.setItem(`${storagePrefix}preferences`, JSON.stringify({ dailyGoals, customSongs }));
  }, [tasks, labels, sessions, dailyGoals, customSongs, isInitialized, user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkTimerActive && workTimerLeft > 0) {
      interval = setInterval(() => setWorkTimerLeft(prev => prev - 1), 1000);
    } else if (workTimerLeft === 0 && isWorkTimerActive) {
      setWorkTimerActive(false);
      addSession(Math.floor(TIMER_CONFIG.work / 60), 'work');
      setWorkTimerLeft(TIMER_CONFIG.work);
    }
    return () => clearInterval(interval);
  }, [isWorkTimerActive, workTimerLeft]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreakTimerActive && breakTimerLeft > 0) {
      interval = setInterval(() => setBreakTimerLeft(prev => prev - 1), 1000);
    } else if (breakTimerLeft === 0 && isBreakTimerActive) {
      setBreakTimerActive(false);
      addSession(Math.floor(TIMER_CONFIG.short / 60), 'short');
      setBreakTimerLeft(TIMER_CONFIG.short);
    }
    return () => clearInterval(interval);
  }, [isBreakTimerActive, breakTimerLeft]);

  const streak = useMemo(() => {
    if (!tasks.length) return 0;
    let currentStreak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const completedOnDate = tasks.some(t => t.dueDate === dateStr && t.completed);
      if (completedOnDate) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        if (isSameDay(checkDate, new Date())) {
          checkDate = subDays(checkDate, 1);
          continue;
        }
        break;
      }
    }
    return currentStreak;
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addLabel = (name: string, color: string) => {
    const newLabel: Label = {
      id: crypto.randomUUID(),
      name: name.toLowerCase().trim(),
      color
    };
    setLabels(prev => [...prev, newLabel]);
  };

  const deleteLabel = (id: string) => {
    setLabels(prev => prev.filter(l => l.id !== id));
  };

  const addSession = (durationMinutes: number, type: 'work' | 'short' | 'manual', note?: string, date?: string) => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      startTime: Date.now(),
      durationMinutes,
      type,
      date: date || format(new Date(), 'yyyy-MM-dd'),
      note: note || "",
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const updateSession = (id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const setDailyGoal = (date: string, target: number) => {
    setDailyGoals(prev => ({ ...prev, [date]: target }));
  };

  const addCustomSong = (label: string, url: string) => {
    const newSong: CustomSong = { id: crypto.randomUUID(), label, url };
    setCustomSongs(prev => [...prev, newSong]);
  };

  const removeCustomSong = (id: string) => {
    setCustomSongs(prev => prev.filter(s => s.id !== id));
  };

  const resetWorkTimer = useCallback(() => {
    setWorkTimerActive(false);
    setWorkTimerLeft(TIMER_CONFIG.work);
  }, []);

  const resetBreakTimer = useCallback(() => {
    setBreakTimerActive(false);
    setBreakTimerLeft(TIMER_CONFIG.short);
  }, []);

  return (
    <TaskContext.Provider value={{ 
      tasks, labels, sessions, dailyGoals, customSongs, streak,
      workTimerLeft, breakTimerLeft, isWorkTimerActive, isBreakTimerActive,
      addTask, updateTask, deleteTask, toggleTask, addLabel, deleteLabel, 
      addSession, updateSession, deleteSession, setDailyGoal, addCustomSong, removeCustomSong,
      setWorkTimerActive: (a) => { if(a) setBreakTimerActive(false); setWorkTimerActive(a); },
      setBreakTimerActive: (a) => { if(a) setWorkTimerActive(false); setBreakTimerActive(a); },
      resetWorkTimer, resetBreakTimer,
      isInitialized: isInitialized && !authLoading 
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) throw new Error('useTaskContext must be used within a TaskProvider');
  return context;
}
