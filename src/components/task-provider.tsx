"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Label, Session, TaskContextType } from '@/lib/types';
import { format } from 'date-fns';

const DEFAULT_LABELS: Label[] = [
  { id: '1', name: 'work', color: 'bg-blue-600 text-white hover:bg-blue-700' },
  { id: '2', name: 'personal', color: 'bg-purple-600 text-white hover:bg-purple-700' },
  { id: '3', name: 'shopping', color: 'bg-orange-500 text-white hover:bg-orange-600' },
  { id: '4', name: 'urgent', color: 'bg-red-600 text-white hover:bg-red-700' },
  { id: '5', name: 'other', color: 'bg-slate-600 text-white hover:bg-slate-700' },
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<Label[]>(DEFAULT_LABELS);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('daily_task_track_tasks');
    const savedLabels = localStorage.getItem('daily_task_track_labels');
    const savedSessions = localStorage.getItem('daily_task_track_sessions');
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
    
    if (savedLabels) {
      try {
        setLabels(JSON.parse(savedLabels));
      } catch (e) {
        console.error("Failed to parse labels", e);
      }
    }

    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('daily_task_track_tasks', JSON.stringify(tasks));
      localStorage.setItem('daily_task_track_labels', JSON.stringify(labels));
      localStorage.setItem('daily_task_track_sessions', JSON.stringify(sessions));
    }
  }, [tasks, labels, sessions, isInitialized]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      label: taskData.label || 'other',
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const addLabel = (name: string, color: string) => {
    const newLabel: Label = {
      id: crypto.randomUUID(),
      name: name.toLowerCase().trim(),
      color: color,
    };
    setLabels((prev) => [...prev, newLabel]);
  };

  const deleteLabel = (id: string) => {
    setLabels((prev) => prev.filter((l) => l.id !== id));
  };

  const addSession = (durationMinutes: number, type: 'work' | 'short') => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      startTime: Date.now(),
      durationMinutes,
      type,
      date: format(new Date(), 'yyyy-MM-dd'),
    };
    setSessions(prev => [newSession, ...prev]);
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      labels, 
      sessions,
      addTask, 
      updateTask, 
      deleteTask, 
      toggleTask, 
      addLabel, 
      deleteLabel, 
      addSession,
      isInitialized 
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
