
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
  Unsubscribe
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

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

  const syncLocal = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newTask: Task = { ...taskData, id, createdAt: Date.now() };
    
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'tasks', id);
      setDoc(docRef, newTask).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newTask
        }));
      });
    } else {
      setTasks(prev => [...prev, newTask].sort((a, b) => b.createdAt - a.createdAt));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_tasks') || '[]');
      syncLocal('daily_task_track_tasks', [...stored, newTask]);
    }
  }, [user, firestore]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'tasks', id);
      updateDoc(docRef, updates).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updates
        }));
      });
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_tasks') || '[]');
      syncLocal('daily_task_track_tasks', stored.map((t: Task) => t.id === id ? { ...t, ...updates } : t));
    }
  }, [user, firestore]);

  const deleteTask = useCallback((id: string) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'tasks', id);
      deleteDoc(docRef).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_tasks') || '[]');
      syncLocal('daily_task_track_tasks', stored.filter((t: Task) => t.id !== id));
    }
  }, [user, firestore]);

  const toggleTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { completed: !task.completed });
    }
  }, [tasks, updateTask]);

  const addLabel = useCallback((name: string, color: string) => {
    const id = generateId();
    const newLabel: Label = { id, name: name.toLowerCase().trim(), color };
    
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'labels', id);
      setDoc(docRef, newLabel).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newLabel
        }));
      });
    } else {
      setLabels(prev => [...prev, newLabel]);
      const stored = JSON.parse(localStorage.getItem('daily_task_track_labels') || '[]');
      syncLocal('daily_task_track_labels', [...stored, newLabel]);
    }
  }, [user, firestore]);

  const deleteLabel = useCallback((id: string) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'labels', id);
      deleteDoc(docRef).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
    } else {
      setLabels(prev => prev.filter(l => l.id !== id));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_labels') || '[]');
      syncLocal('daily_task_track_labels', stored.filter((l: Label) => l.id !== id));
    }
  }, [user, firestore]);

  const addSession = useCallback((durationMinutes: number, type: 'work' | 'short' | 'manual', note?: string, date?: string) => {
    const id = generateId();
    const newSession: Session = {
      id,
      startTime: Date.now(),
      durationMinutes,
      type,
      date: date || format(new Date(), 'yyyy-MM-dd'),
      note: note || "",
    };
    
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'sessions', id);
      setDoc(docRef, newSession).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newSession
        }));
      });
    } else {
      setSessions(prev => [newSession, ...prev].sort((a, b) => b.startTime - a.startTime));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_sessions') || '[]');
      syncLocal('daily_task_track_sessions', [newSession, ...stored]);
    }
  }, [user, firestore]);

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'sessions', id);
      updateDoc(docRef, updates).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updates
        }));
      });
    } else {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_sessions') || '[]');
      syncLocal('daily_task_track_sessions', stored.map((s: Session) => s.id === id ? { ...s, ...updates } : s));
    }
  }, [user, firestore]);

  const deleteSession = useCallback((id: string) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'sessions', id);
      deleteDoc(docRef).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
    } else {
      setSessions(prev => prev.filter(s => s.id !== id));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_sessions') || '[]');
      syncLocal('daily_task_track_sessions', stored.filter((s: Session) => s.id !== id));
    }
  }, [user, firestore]);

  const setDailyGoal = useCallback((date: string, target: number) => {
    const newGoals = { ...dailyGoals, [date]: target };
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'preferences', 'main');
      setDoc(docRef, { dailyGoals: newGoals }, { merge: true });
    } else {
      setDailyGoals(newGoals);
      const stored = JSON.parse(localStorage.getItem('daily_task_track_prefs') || '{}');
      syncLocal('daily_task_track_prefs', { ...stored, dailyGoals: newGoals });
    }
  }, [user, firestore, dailyGoals]);

  const addCustomSong = useCallback((label: string, url: string) => {
    const newSong: CustomSong = { id: generateId(), label, url };
    const newSongs = [...customSongs, newSong];
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'preferences', 'main');
      setDoc(docRef, { customSongs: newSongs }, { merge: true });
    } else {
      setCustomSongs(newSongs);
      const stored = JSON.parse(localStorage.getItem('daily_task_track_prefs') || '{}');
      syncLocal('daily_task_track_prefs', { ...stored, customSongs: newSongs });
    }
  }, [user, firestore, customSongs]);

  const removeCustomSong = useCallback((id: string) => {
    const newSongs = customSongs.filter(s => s.id !== id);
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'preferences', 'main');
      setDoc(docRef, { customSongs: newSongs }, { merge: true });
    } else {
      setCustomSongs(newSongs);
      const stored = JSON.parse(localStorage.getItem('daily_task_track_prefs') || '{}');
      syncLocal('daily_task_track_prefs', { ...stored, customSongs: newSongs });
    }
  }, [user, firestore, customSongs]);

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
  }, [isWorkTimerActive, workTimerLeft, addSession]);

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
  }, [isBreakTimerActive, breakTimerLeft, addSession]);

  useEffect(() => {
    if (authLoading || !firestore) return;

    if (!user) {
      try {
        const storedTasks = localStorage.getItem('daily_task_track_tasks');
        const storedLabels = localStorage.getItem('daily_task_track_labels');
        const storedSessions = localStorage.getItem('daily_task_track_sessions');
        const storedPrefs = localStorage.getItem('daily_task_track_prefs');

        if (storedTasks) setTasks(JSON.parse(storedTasks).sort((a: any, b: any) => b.createdAt - a.createdAt));
        if (storedLabels) setLabels(JSON.parse(storedLabels));
        else setLabels(DEFAULT_LABELS);
        if (storedSessions) setSessions(JSON.parse(storedSessions).sort((a: any, b: any) => b.startTime - a.startTime));
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

    const userId = user.uid;
    const unsubs: Unsubscribe[] = [];
    
    const initTimer = setTimeout(() => {
      setIsInitialized(true);
    }, 3000);

    const tasksRef = collection(firestore, 'users', userId, 'tasks');
    unsubs.push(onSnapshot(tasksRef, (snapshot) => {
      setTasks(snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as Task))
        .sort((a, b) => b.createdAt - a.createdAt)
      );
      setIsInitialized(true);
      clearTimeout(initTimer);
    }, (err) => {
      console.error("Firestore sync error (tasks):", err);
      setIsInitialized(true); 
      clearTimeout(initTimer);
    }));

    const labelsRef = collection(firestore, 'users', userId, 'labels');
    unsubs.push(onSnapshot(labelsRef, (snapshot) => {
      const dbLabels = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Label));
      setLabels(dbLabels.length > 0 ? dbLabels : DEFAULT_LABELS);
    }));

    const sessionsRef = collection(firestore, 'users', userId, 'sessions');
    unsubs.push(onSnapshot(sessionsRef, (snapshot) => {
      setSessions(snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as Session))
        .sort((a, b) => b.startTime - a.startTime)
      );
    }));

    unsubs.push(onSnapshot(doc(firestore, 'users', userId, 'preferences', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDailyGoals(data.dailyGoals || {});
        setCustomSongs(data.customSongs || []);
      }
    }));

    return () => {
      unsubs.forEach(unsub => unsub());
      clearTimeout(initTimer);
    };
  }, [user, authLoading, firestore]);

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
      isInitialized
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
