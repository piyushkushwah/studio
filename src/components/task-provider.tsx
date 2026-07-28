
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Task, Label, Session, Note, GrowthNote, Expense, DietEntry, WaterEntry, Exercise, TravelGoal, TaskContextType, CustomSong } from '@/lib/types';
import { format, subDays, isSameDay } from 'date-fns';
import { useUser, useFirestore } from '@/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [growthNotes, setGrowthNotes] = useState<GrowthNote[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [diet, setDiet] = useState<DietEntry[]>([]);
  const [water, setWater] = useState<WaterEntry[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [travelGoals, setTravelGoals] = useState<TravelGoal[]>([]);
  const [dailyGoals, setDailyGoals] = useState<Record<string, number>>({});
  const [waterGoal, setWaterGoalLocal] = useState(2000);
  const [calorieGoal, setCalorieGoalLocal] = useState(2000);
  const [height, setHeightLocal] = useState(170);
  const [weight, setWeightLocal] = useState(70);
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

  const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    const now = Date.now();
    const newNote: Note = { ...noteData, id, createdAt: now, updatedAt: now };
    
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'notes', id);
      setDoc(docRef, newNote).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newNote
        }));
      });
    } else {
      setNotes(prev => [newNote, ...prev]);
      const stored = JSON.parse(localStorage.getItem('daily_task_track_notes') || '[]');
      syncLocal('daily_task_track_notes', [newNote, ...stored]);
    }
  }, [user, firestore]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const now = Date.now();
    const finalUpdates = { ...updates, updatedAt: now };
    
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'notes', id);
      updateDoc(docRef, finalUpdates).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: finalUpdates
        }));
      });
    } else {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...finalUpdates } : n));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_notes') || '[]');
      syncLocal('daily_task_track_notes', stored.map((n: Note) => n.id === id ? { ...n, ...finalUpdates } : n));
    }
  }, [user, firestore]);

  const deleteNote = useCallback((id: string) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'notes', id);
      deleteDoc(docRef).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
    } else {
      setNotes(prev => prev.filter(n => n.id !== id));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_notes') || '[]');
      syncLocal('daily_task_track_notes', stored.filter((n: Note) => n.id !== id));
    }
  }, [user, firestore]);

  const addGrowthNote = useCallback((noteData: Omit<GrowthNote, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newNote: GrowthNote = { ...noteData, id, createdAt: Date.now() };
    
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'growthNotes', id);
      setDoc(docRef, newNote).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newNote
        }));
      });
    } else {
      setGrowthNotes(prev => [newNote, ...prev]);
      const stored = JSON.parse(localStorage.getItem('daily_task_track_growth') || '[]');
      syncLocal('daily_task_track_growth', [newNote, ...stored]);
    }
  }, [user, firestore]);

  const updateGrowthNote = useCallback((id: string, updates: Partial<GrowthNote>) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'growthNotes', id);
      updateDoc(docRef, updates).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updates
        }));
      });
    } else {
      setGrowthNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_growth') || '[]');
      syncLocal('daily_task_track_growth', stored.map((n: GrowthNote) => n.id === id ? { ...n, ...updates } : n));
    }
  }, [user, firestore]);

  const deleteGrowthNote = useCallback((id: string) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'growthNotes', id);
      deleteDoc(docRef).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
    } else {
      setGrowthNotes(prev => prev.filter(n => n.id !== id));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_growth') || '[]');
      syncLocal('daily_task_track_growth', stored.filter((n: GrowthNote) => n.id !== id));
    }
  }, [user, firestore]);

  const addExpense = useCallback((expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newExpense: Expense = { ...expenseData, id, createdAt: Date.now() };
    
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'expenses', id);
      setDoc(docRef, newExpense).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newExpense
        }));
      });
    } else {
      setExpenses(prev => [newExpense, ...prev].sort((a, b) => b.createdAt - a.createdAt));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_expenses') || '[]');
      syncLocal('daily_task_track_expenses', [newExpense, ...stored]);
    }
  }, [user, firestore]);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'expenses', id);
      updateDoc(docRef, updates).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updates
        }));
      });
    } else {
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_expenses') || '[]');
      syncLocal('daily_task_track_expenses', stored.map((e: Expense) => e.id === id ? { ...e, ...updates } : e));
    }
  }, [user, firestore]);

  const deleteExpense = useCallback((id: string) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'expenses', id);
      deleteDoc(docRef).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
    } else {
      setExpenses(prev => prev.filter(e => e.id !== id));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_expenses') || '[]');
      syncLocal('daily_task_track_expenses', stored.filter((e: Expense) => e.id !== id));
    }
  }, [user, firestore]);

  const addDietEntry = useCallback((entryData: Omit<DietEntry, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newEntry: DietEntry = { ...entryData, id, createdAt: Date.now() };
    
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'diet', id);
      setDoc(docRef, newEntry).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newEntry
        }));
      });
    } else {
      setDiet(prev => [newEntry, ...prev]);
      const stored = JSON.parse(localStorage.getItem('daily_task_track_diet') || '[]');
      syncLocal('daily_task_track_diet', [newEntry, ...stored]);
    }
  }, [user, firestore]);

  const deleteDietEntry = useCallback((id: string) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'diet', id);
      deleteDoc(docRef).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
    } else {
      setDiet(prev => prev.filter(d => d.id !== id));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_diet') || '[]');
      syncLocal('daily_task_track_diet', stored.filter((d: DietEntry) => d.id !== id));
    }
  }, [user, firestore]);

  const addWaterEntry = useCallback((amount: number, date?: string) => {
    const id = generateId();
    const newEntry: WaterEntry = {
      id,
      amount,
      date: date || format(new Date(), 'yyyy-MM-dd'),
      createdAt: Date.now()
    };
    
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'water', id);
      setDoc(docRef, newEntry).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newEntry
        }));
      });
    } else {
      setWater(prev => [...prev, newEntry]);
      const stored = JSON.parse(localStorage.getItem('daily_task_track_water') || '[]');
      syncLocal('daily_task_track_water', [...stored, newEntry]);
    }
  }, [user, firestore]);

  const deleteWaterEntry = useCallback((id: string) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'water', id);
      deleteDoc(docRef).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
    } else {
      setWater(prev => prev.filter(w => w.id !== id));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_water') || '[]');
      syncLocal('daily_task_track_water', stored.filter((w: WaterEntry) => w.id !== id));
    }
  }, [user, firestore]);

  const addExercise = useCallback((exerciseData: Omit<Exercise, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newExercise: Exercise = { ...exerciseData, id, createdAt: Date.now() };
    
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'exercises', id);
      setDoc(docRef, newExercise).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newExercise
        }));
      });
    } else {
      setExercises(prev => [newExercise, ...prev].sort((a, b) => b.createdAt - a.createdAt));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_exercises') || '[]');
      syncLocal('daily_task_track_exercises', [newExercise, ...stored]);
    }
  }, [user, firestore]);

  const deleteExercise = useCallback((id: string) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'exercises', id);
      deleteDoc(docRef).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
    } else {
      setExercises(prev => prev.filter(e => e.id !== id));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_exercises') || '[]');
      syncLocal('daily_task_track_exercises', stored.filter((e: Exercise) => e.id !== id));
    }
  }, [user, firestore]);

  const addTravelGoal = useCallback((goalData: Omit<TravelGoal, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newGoal: TravelGoal = { ...goalData, id, createdAt: Date.now() };
    
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'travelGoals', id);
      setDoc(docRef, newGoal).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newGoal
        }));
      });
    } else {
      setTravelGoals(prev => [newGoal, ...prev].sort((a, b) => b.createdAt - a.createdAt));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_travel') || '[]');
      syncLocal('daily_task_track_travel', [newGoal, ...stored]);
    }
  }, [user, firestore]);

  const updateTravelGoal = useCallback((id: string, updates: Partial<TravelGoal>) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'travelGoals', id);
      updateDoc(docRef, updates).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updates
        }));
      });
    } else {
      setTravelGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_travel') || '[]');
      syncLocal('daily_task_track_travel', stored.map((g: TravelGoal) => g.id === id ? { ...g, ...updates } : g));
    }
  }, [user, firestore]);

  const deleteTravelGoal = useCallback((id: string) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'travelGoals', id);
      deleteDoc(docRef).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
    } else {
      setTravelGoals(prev => prev.filter(g => g.id !== id));
      const stored = JSON.parse(localStorage.getItem('daily_task_track_travel') || '[]');
      syncLocal('daily_task_track_travel', stored.filter((g: TravelGoal) => g.id !== id));
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

  const setWaterGoal = useCallback((target: number) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'preferences', 'main');
      setDoc(docRef, { waterGoal: target }, { merge: true });
    } else {
      setWaterGoalLocal(target);
      const stored = JSON.parse(localStorage.getItem('daily_task_track_prefs') || '{}');
      syncLocal('daily_task_track_prefs', { ...stored, waterGoal: target });
    }
  }, [user, firestore]);

  const setCalorieGoal = useCallback((target: number) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'preferences', 'main');
      setDoc(docRef, { calorieGoal: target }, { merge: true });
    } else {
      setCalorieGoalLocal(target);
      const stored = JSON.parse(localStorage.getItem('daily_task_track_prefs') || '{}');
      syncLocal('daily_task_track_prefs', { ...stored, calorieGoal: target });
    }
  }, [user, firestore]);

  const setPhysicalProfile = useCallback((h: number, w: number) => {
    if (user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'preferences', 'main');
      setDoc(docRef, { height: h, weight: w }, { merge: true });
    } else {
      setHeightLocal(h);
      setWeightLocal(w);
      const stored = JSON.parse(localStorage.getItem('daily_task_track_prefs') || '{}');
      syncLocal('daily_task_track_prefs', { ...stored, height: h, weight: w });
    }
  }, [user, firestore]);

  const addCustomSong = useCallback((label: string, url: string) => {
    const newSong = { id: generateId(), label, url };
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
        const storedNotes = localStorage.getItem('daily_task_track_notes');
        const storedGrowth = localStorage.getItem('daily_task_track_growth');
        const storedExpenses = localStorage.getItem('daily_task_track_expenses');
        const storedDiet = localStorage.getItem('daily_task_track_diet');
        const storedWater = localStorage.getItem('daily_task_track_water');
        const storedExercises = localStorage.getItem('daily_task_track_exercises');
        const storedTravel = localStorage.getItem('daily_task_track_travel');
        const storedPrefs = localStorage.getItem('daily_task_track_prefs');

        if (storedTasks) setTasks(JSON.parse(storedTasks).sort((a: any, b: any) => b.createdAt - a.createdAt));
        if (storedLabels) setLabels(JSON.parse(storedLabels));
        else setLabels(DEFAULT_LABELS);
        if (storedSessions) setSessions(JSON.parse(storedSessions).sort((a: any, b: any) => b.startTime - a.startTime));
        if (storedNotes) setNotes(JSON.parse(storedNotes).sort((a: any, b: any) => b.updatedAt - a.updatedAt));
        if (storedGrowth) setGrowthNotes(JSON.parse(storedGrowth).sort((a: any, b: any) => b.createdAt - a.createdAt));
        if (storedExpenses) setExpenses(JSON.parse(storedExpenses).sort((a: any, b: any) => b.createdAt - a.createdAt));
        if (storedDiet) setDiet(JSON.parse(storedDiet));
        if (storedWater) setWater(JSON.parse(storedWater));
        if (storedExercises) setExercises(JSON.parse(storedExercises).sort((a: any, b: any) => b.createdAt - a.createdAt));
        if (storedTravel) setTravelGoals(JSON.parse(storedTravel).sort((a: any, b: any) => b.createdAt - a.createdAt));
        if (storedPrefs) {
          const prefs = JSON.parse(storedPrefs);
          setDailyGoals(prefs.dailyGoals || {});
          setWaterGoalLocal(prefs.waterGoal || 2000);
          setCalorieGoalLocal(prefs.calorieGoal || 2000);
          setHeightLocal(prefs.height || 170);
          setWeightLocal(prefs.weight || 70);
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
    }, 5000);

    const tasksRef = collection(firestore, 'users', userId, 'tasks');
    unsubs.push(onSnapshot(tasksRef, (snapshot) => {
      setTasks(snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as Task))
        .sort((a, b) => b.createdAt - a.createdAt)
      );
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

    const notesRef = collection(firestore, 'users', userId, 'notes');
    unsubs.push(onSnapshot(notesRef, (snapshot) => {
      setNotes(snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as Note))
        .sort((a, b) => b.updatedAt - a.updatedAt)
      );
    }));

    const growthRef = collection(firestore, 'users', userId, 'growthNotes');
    unsubs.push(onSnapshot(growthRef, (snapshot) => {
      setGrowthNotes(snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as GrowthNote))
        .sort((a, b) => b.createdAt - a.createdAt)
      );
    }));

    const expensesRef = collection(firestore, 'users', userId, 'expenses');
    unsubs.push(onSnapshot(expensesRef, (snapshot) => {
      setExpenses(snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as Expense))
        .sort((a, b) => b.createdAt - a.createdAt)
      );
    }));

    const dietRef = collection(firestore, 'users', userId, 'diet');
    unsubs.push(onSnapshot(dietRef, (snapshot) => {
      setDiet(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DietEntry)));
    }));

    const waterRef = collection(firestore, 'users', userId, 'water');
    unsubs.push(onSnapshot(waterRef, (snapshot) => {
      setWater(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as WaterEntry)));
    }));

    const exercisesRef = collection(firestore, 'users', userId, 'exercises');
    unsubs.push(onSnapshot(exercisesRef, (snapshot) => {
      setExercises(snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as Exercise))
        .sort((a, b) => b.createdAt - a.createdAt)
      );
    }));

    const travelRef = collection(firestore, 'users', userId, 'travelGoals');
    unsubs.push(onSnapshot(travelRef, (snapshot) => {
      setTravelGoals(snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as TravelGoal))
        .sort((a, b) => b.createdAt - a.createdAt)
      );
    }));

    unsubs.push(onSnapshot(doc(firestore, 'users', userId, 'preferences', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDailyGoals(data.dailyGoals || {});
        setWaterGoalLocal(data.waterGoal || 2000);
        setCalorieGoalLocal(data.calorieGoal || 2000);
        setHeightLocal(data.height || 170);
        setWeightLocal(data.weight || 70);
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
      tasks, labels, sessions, notes, growthNotes, expenses, diet, water, exercises, travelGoals, dailyGoals, customSongs, streak,
      waterGoal, calorieGoal, height, weight,
      workTimerLeft, breakTimerLeft, isWorkTimerActive, isBreakTimerActive,
      addTask, updateTask, deleteTask, toggleTask, addLabel, deleteLabel, 
      addSession, updateSession, deleteSession, 
      addNote, updateNote, deleteNote,
      addGrowthNote, updateGrowthNote, deleteGrowthNote,
      addExpense, updateExpense, deleteExpense,
      addDietEntry, deleteDietEntry, addWaterEntry, deleteWaterEntry,
      addExercise, deleteExercise,
      addTravelGoal, updateTravelGoal, deleteTravelGoal,
      setDailyGoal, setWaterGoal, setCalorieGoal, setPhysicalProfile, addCustomSong, removeCustomSong,
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
