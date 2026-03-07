
import { renderHook, act } from '@testing-library/react';
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

  it('should initialize with default labels', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });
    
    expect(result.current.labels.length).toBeGreaterThan(0);
    expect(result.current.labels.find(l => l.name === 'work')).toBeDefined();
    expect(result.current.labels.find(l => l.name === 'personal')).toBeDefined();
  });

  it('should add a task correctly', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

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
    expect(result.current.tasks[0].label).toBe('work');
    expect(result.current.tasks[0].id).toBeDefined();
  });

  it('should update an existing task', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

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

  it('should toggle task completion status', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    act(() => {
      result.current.addTask({
        description: 'Toggle Task',
        dueDate: '2024-01-01',
        completed: false
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.toggleTask(taskId);
    });

    expect(result.current.tasks[0].completed).toBe(true);

    act(() => {
      result.current.toggleTask(taskId);
    });

    expect(result.current.tasks[0].completed).toBe(false);
  });

  it('should delete a task', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

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

  it('should add and delete custom labels', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    act(() => {
      result.current.addLabel('Custom Label', 'bg-red-500');
    });

    expect(result.current.labels.some(l => l.name === 'custom label')).toBe(true);

    const labelId = result.current.labels.find(l => l.name === 'custom label')?.id;

    act(() => {
      if (labelId) result.current.deleteLabel(labelId);
    });

    expect(result.current.labels.some(l => l.name === 'custom label')).toBe(false);
  });

  it('should persist tasks to localStorage', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    act(() => {
      result.current.addTask({
        description: 'Persisted Task',
        dueDate: '2024-01-01',
        completed: false
      });
    });

    const stored = JSON.parse(window.localStorage.getItem('daily_task_track_tasks') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].description).toBe('Persisted Task');
  });
});
