
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Task, Label, Session, TaskContextType, CustomSong } from '@/lib/types';
import { format, subDays, isSameDay } from 'date-fns';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { useFirestore, useAuth, useUser } from '@/firebase';
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

export function TaskProvider({ children }: { children: ReactNode }) {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();

  // Global Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<Label[]>(DEFAULT_LABELS);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dailyGoals, setDailyGoals] = useState<Record<string, number>>({});
  const [customSongs, setCustomSongs] = useState<CustomSong[]>([]);
  
  // Timer States
  const [workTimerLeft, setWorkTimerLeft] = useState(TIMER_CONFIG.work);
  const [breakTimerLeft, setBreakTimerLeft] = useState(TIMER_CONFIG.short);
  const [isWorkTimerActive, setWorkTimerActive] = useState(false);
  const [isBreakTimerActive, setBreakTimerActive] = useState(false);
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Reset state when user logs out
  useEffect(() => {
    if (!authLoading && !user) {
      setTasks([]);
      setLabels(DEFAULT_LABELS);
      setSessions([]);
      setDailyGoals({});
      setCustomSongs([]);
      setIsInitialized(true);
    }
  }, [user, authLoading]);

  // Firestore Sync Effect - Scoped to user.uid
  useEffect(() => {
    if (!db || !user) {
      if (!authLoading) setIsInitialized(true);
      return;
    }

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const labelsRef = collection(db, 'users', user.uid, 'labels');
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const prefsRef = doc(db, 'users', user.uid, 'preferences', 'main');

    const unsubTasks = onSnapshot(tasksRef, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
    }, (err) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: tasksRef.path, operation: 'list' })));

    const unsubLabels = onSnapshot(labelsRef, (snapshot) => {
      const dbLabels = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Label));
      setLabels(dbLabels.length > 0 ? dbLabels : DEFAULT_LABELS);
    }, (err) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: labelsRef.path, operation: 'list' })));

    const unsubSessions = onSnapshot(sessionsRef, (snapshot) => {
      setSessions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Session)).sort((a,b) => b.startTime - a.startTime));
    }, (err) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: sessionsRef.path, operation: 'list' })));

    const unsubPrefs = onSnapshot(prefsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDailyGoals(data.dailyGoals || {});
        setCustomSongs(data.customSongs || []);
      }
    }, (err) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: prefsRef.path, operation: 'get' })));

    // We consider it initialized as soon as listeners are set up
    setIsInitialized(true);

    return () => {
      unsubTasks();
      unsubLabels();
      unsubSessions();
      unsubPrefs();
    };
  }, [db, user, authLoading]);

  // Timer Effects
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
    if (!db || !user) return;
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    addDoc(tasksRef, { ...taskData, createdAt: Date.now() })
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: tasksRef.path, operation: 'create', requestResourceData: taskData })));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    if (!db || !user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    updateDoc(taskRef, updates)
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: taskRef.path, operation: 'update', requestResourceData: updates })));
  };

  const deleteTask = (id: string) => {
    if (!db || !user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    deleteDoc(taskRef)
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: taskRef.path, operation: 'delete' })));
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) updateTask(id, { completed: !task.completed });
  };

  const addLabel = (name: string, color: string) => {
    if (!db || !user) return;
    const labelsRef = collection(db, 'users', user.uid, 'labels');
    addDoc(labelsRef, { name: name.toLowerCase().trim(), color })
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: labelsRef.path, operation: 'create' })));
  };

  const deleteLabel = (id: string) => {
    if (!db || !user) return;
    const labelRef = doc(db, 'users', user.uid, 'labels', id);
    deleteDoc(labelRef)
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: labelRef.path, operation: 'delete' })));
  };

  const addSession = (durationMinutes: number, type: 'work' | 'short' | 'manual', note?: string, date?: string) => {
    if (!db || !user) return;
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const data = {
      startTime: Date.now(),
      durationMinutes,
      type,
      date: date || format(new Date(), 'yyyy-MM-dd'),
      note: note || "",
    };
    addDoc(sessionsRef, data)
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: sessionsRef.path, operation: 'create' })));
  };

  const updateSession = (id: string, updates: Partial<Session>) => {
    if (!db || !user) return;
    const sessionRef = doc(db, 'users', user.uid, 'sessions', id);
    updateDoc(sessionRef, updates)
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: sessionRef.path, operation: 'update' })));
  };

  const deleteSession = (id: string) => {
    if (!db || !user) return;
    const sessionRef = doc(db, 'users', user.uid, 'sessions', id);
    deleteDoc(sessionRef)
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: sessionRef.path, operation: 'delete' })));
  };

  const setDailyGoal = (date: string, target: number) => {
    if (!db || !user) return;
    const prefsRef = doc(db, 'users', user.uid, 'preferences', 'main');
    setDoc(prefsRef, { dailyGoals: { ...dailyGoals, [date]: target } }, { merge: true })
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: prefsRef.path, operation: 'update' })));
  };

  const addCustomSong = (label: string, url: string) => {
    if (!db || !user) return;
    const prefsRef = doc(db, 'users', user.uid, 'preferences', 'main');
    const newSong = { id: crypto.randomUUID(), label, url };
    setDoc(prefsRef, { customSongs: [...customSongs, newSong] }, { merge: true })
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: prefsRef.path, operation: 'update' })));
  };

  const removeCustomSong = (id: string) => {
    if (!db || !user) return;
    const prefsRef = doc(db, 'users', user.uid, 'preferences', 'main');
    setDoc(prefsRef, { customSongs: customSongs.filter(s => s.id !== id) }, { merge: true })
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: prefsRef.path, operation: 'update' })));
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
