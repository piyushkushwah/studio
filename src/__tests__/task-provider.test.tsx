
import { renderHook, act, waitFor } from '@testing-library/react';
import { TaskProvider, useTaskContext } from '@/components/task-provider';
import { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const wrapper = ({ children }: { children: ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
);

describe('TaskProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default labels', async () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });
    
    // Wait for provider to load from localStorage and set isInitialized
    await waitFor(() => expect(result.current.isInitialized).toBe(true));
    
    expect(result.current.labels.length).toBeGreaterThan(0);
    expect(result.current.labels.find(l => l.name === 'work')).toBeDefined();
  });

  it('should add a task correctly', async () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });
    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    act(() => {
      result.current.addTask({
        description: 'New Task',
        dueDate: '2024-01-01',
        completed: false,
        label: 'work'
      });
    });

    expect(result.current.tasks.length).toBe(1);
    expect(result.current.tasks[0].description).toBe('New Task');
    expect(result.current.tasks[0].id).toBeDefined();
  });

  it('should update an existing task', async () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });
    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    act(() => {
      result.current.addTask({
        description: 'Original Task',
        dueDate: '2024-01-01',
        completed: false
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.updateTask(taskId, { description: 'Updated Task' });
    });

    expect(result.current.tasks[0].description).toBe('Updated Task');
  });

  it('should delete a task', async () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });
    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    act(() => {
      result.current.addTask({
        description: 'Task to Delete',
        dueDate: '2024-01-01',
        completed: false
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.deleteTask(taskId);
    });

    expect(result.current.tasks.length).toBe(0);
  });

  it('should persist tasks to localStorage after changes', async () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });
    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    act(() => {
      result.current.addTask({
        description: 'Persisted Task',
        dueDate: '2024-01-01',
        completed: false
      });
    });

    // Wait for the save effect to run
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem('daily_task_track_tasks') || '[]');
      return expect(stored.length).toBe(1);
    });
  });
});
