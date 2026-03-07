"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Label } from '@/lib/types';

const DEFAULT_LABELS: Label[] = [
  { id: '1', name: 'work', color: 'bg-blue-600 text-white hover:bg-blue-700' },
  { id: '2', name: 'personal', color: 'bg-purple-600 text-white hover:bg-purple-700' },
  { id: '3', name: 'shopping', color: 'bg-orange-500 text-white hover:bg-orange-600' },
  { id: '4', name: 'urgent', color: 'bg-red-600 text-white hover:bg-red-700' },
  { id: '5', name: 'other', color: 'bg-slate-600 text-white hover:bg-slate-700' },
];

interface TaskContextType {
  tasks: Task[];
  labels: Label[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addLabel: (name: string, color: string) => void;
  deleteLabel: (id: string) => void;
  isInitialized: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<Label[]>(DEFAULT_LABELS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('daily_task_track_tasks');
    const savedLabels = localStorage.getItem('daily_task_track_labels');
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
    
    if (savedLabels) {
      try {
        const parsed = JSON.parse(savedLabels);
        // Migrating old low-contrast labels if they exist
        const migrated = parsed.map((l: Label) => {
          if (l.color.includes('-100')) {
             const base = l.color.split('-')[1];
             return { ...l, color: `bg-${base}-600 text-white hover:bg-${base}-700` };
          }
          return l;
        });
        setLabels(migrated);
      } catch (e) {
        console.error("Failed to parse labels", e);
      }
    }
    
    setIsInitialized(true);
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('daily_task_track_tasks', JSON.stringify(tasks));
      localStorage.setItem('daily_task_track_labels', JSON.stringify(labels));
    }
  }, [tasks, labels, isInitialized]);

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

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      labels, 
      addTask, 
      updateTask, 
      deleteTask, 
      toggleTask, 
      addLabel, 
      deleteLabel, 
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
