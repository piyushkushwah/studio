'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Task, Label, Session, TaskContextType, CustomSong, Priority } from '@/lib/types';
import { format, subDays, isSameDay } from 'date-fns';
import { useUser, useFirestore } from '@/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy,
  limit
} from 'firebase/firestore';

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
  const firestore = useFirestore();

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

  // Persistence Logic: Guest (localStorage) vs Authenticated (Firestore)
  useEffect(() => {
    if (authLoading || !firestore) return;

    if (!user) {
      // GUEST MODE
      try {
        const storedTasks = localStorage.getItem('daily_task_track_tasks');
        const storedLabels = localStorage.getItem('daily_task_track_labels');
        const storedSessions = localStorage.getItem('daily_task_track_sessions');
        const storedPrefs = localStorage.getItem('daily_task_track_prefs');

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
        console.error("Failed to load local storage", e);
      }
      setIsInitialized(true);
      return;
    }

    // AUTHENTICATED MODE (Real-time Firestore)
    const userId = user.uid;
    
    // 1. Tasks listener
    const tasksQuery = query(collection(firestore, 'users', userId, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task)));
    });

    // 2. Labels listener
    const labelsQuery = query(collection(firestore, 'users', userId, 'labels'));
    const unsubLabels = onSnapshot(labelsQuery, (snapshot) => {
      const dbLabels = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Label));
      setLabels(dbLabels.length > 0 ? dbLabels : DEFAULT_LABELS);
    });

    // 3. Sessions listener (time logs)
    const sessionsQuery = query(collection(firestore, 'users', userId, 'sessions'), orderBy('startTime', 'desc'));
    const unsubSessions = onSnapshot(sessionsQuery, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Session)));
    });

    // 4. Preferences listener (goals, songs)
    const unsubPrefs = onSnapshot(doc(firestore, 'users', userId, 'preferences', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDailyGoals(data.dailyGoals || {});
        setCustomSongs(data.customSongs || []);
      }
    });

    setIsInitialized(true);

    return () => {
      unsubTasks();
      unsubLabels();
      unsubSessions();
      unsubPrefs();
    };
  }, [user, authLoading, firestore]);

  // Pomodoro Timer Effects
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

  // CRUD ACTIONS
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const newTask: Task = { ...taskData, id, createdAt: Date.now() };
    
    if (user && firestore) {
      await setDoc(doc(firestore, 'users', user.uid, 'tasks', id), newTask);
    } else {
      const newTasks = [...tasks, newTask];
      setTasks(newTasks);
      localStorage.setItem('daily_task_track_tasks', JSON.stringify(newTasks));
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (user && firestore) {
      await updateDoc(doc(firestore, 'users', user.uid, 'tasks', id), updates);
    } else {
      const newTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
      setTasks(newTasks);
      localStorage.setItem('daily_task_track_tasks', JSON.stringify(newTasks));
    }
  };

  const deleteTask = async (id: string) => {
    if (user && firestore) {
      await deleteDoc(doc(firestore, 'users', user.uid, 'tasks', id));
    } else {
      const newTasks = tasks.filter(t => t.id !== id);
      setTasks(newTasks);
      localStorage.setItem('daily_task_track_tasks', JSON.stringify(newTasks));
    }
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) updateTask(id, { completed: !task.completed });
  };

  const addLabel = async (name: string, color: string) => {
    const id = crypto.randomUUID();
    const newLabel: Label = { id, name: name.toLowerCase().trim(), color };
    
    if (user && firestore) {
      await setDoc(doc(firestore, 'users', user.uid, 'labels', id), newLabel);
    } else {
      const newLabels = [...labels, newLabel];
      setLabels(newLabels);
      localStorage.setItem('daily_task_track_labels', JSON.stringify(newLabels));
    }
  };

  const deleteLabel = async (id: string) => {
    if (user && firestore) {
      await deleteDoc(doc(firestore, 'users', user.uid, 'labels', id));
    } else {
      const newLabels = labels.filter(l => l.id !== id);
      setLabels(newLabels);
      localStorage.setItem('daily_task_track_labels', JSON.stringify(newLabels));
    }
  };

  const addSession = async (durationMinutes: number, type: 'work' | 'short' | 'manual', note?: string, date?: string) => {
    const id = crypto.randomUUID();
    const newSession: Session = {
      id,
      startTime: Date.now(),
      durationMinutes,
      type,
      date: date || format(new Date(), 'yyyy-MM-dd'),
      note: note || "",
    };
    
    if (user && firestore) {
      await setDoc(doc(firestore, 'users', user.uid, 'sessions', id), newSession);
    } else {
      const newSessions = [newSession, ...sessions];
      setSessions(newSessions);
      localStorage.setItem('daily_task_track_sessions', JSON.stringify(newSessions));
    }
  };

  const updateSession = async (id: string, updates: Partial<Session>) => {
    if (user && firestore) {
      await updateDoc(doc(firestore, 'users', user.uid, 'sessions', id), updates);
    } else {
      const newSessions = sessions.map(s => s.id === id ? { ...s, ...updates } : s);
      setSessions(newSessions);
      localStorage.setItem('daily_task_track_sessions', JSON.stringify(newSessions));
    }
  };

  const deleteSession = async (id: string) => {
    if (user && firestore) {
      await deleteDoc(doc(firestore, 'users', user.uid, 'sessions', id));
    } else {
      const newSessions = sessions.filter(s => s.id !== id);
      setSessions(newSessions);
      localStorage.setItem('daily_task_track_sessions', JSON.stringify(newSessions));
    }
  };

  const setDailyGoal = async (date: string, target: number) => {
    const newGoals = { ...dailyGoals, [date]: target };
    if (user && firestore) {
      await setDoc(doc(firestore, 'users', user.uid, 'preferences', 'main'), { dailyGoals: newGoals }, { merge: true });
    } else {
      setDailyGoals(newGoals);
      localStorage.setItem('daily_task_track_prefs', JSON.stringify({ dailyGoals: newGoals, customSongs }));
    }
  };

  const addCustomSong = async (label: string, url: string) => {
    const newSong: CustomSong = { id: crypto.randomUUID(), label, url };
    const newSongs = [...customSongs, newSong];
    if (user && firestore) {
      await setDoc(doc(firestore, 'users', user.uid, 'preferences', 'main'), { customSongs: newSongs }, { merge: true });
    } else {
      setCustomSongs(newSongs);
      localStorage.setItem('daily_task_track_prefs', JSON.stringify({ dailyGoals, customSongs: newSongs }));
    }
  };

  const removeCustomSong = async (id: string) => {
    const newSongs = customSongs.filter(s => s.id !== id);
    if (user && firestore) {
      await setDoc(doc(firestore, 'users', user.uid, 'preferences', 'main'), { customSongs: newSongs }, { merge: true });
    } else {
      setCustomSongs(newSongs);
      localStorage.setItem('daily_task_track_prefs', JSON.stringify({ dailyGoals, customSongs: newSongs }));
    }
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