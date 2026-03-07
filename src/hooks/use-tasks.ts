"use client";

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('daily_task_track_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('daily_task_track_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isInitialized]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
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

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    isInitialized
  };
}