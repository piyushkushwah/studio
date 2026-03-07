
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskItem } from '@/components/task-item';
import { TaskProvider } from '@/components/task-provider';
import { Task } from '@/lib/types';
import { describe, it, expect, vi } from 'vitest';

const mockTask: Task = {
  id: '1',
  description: 'Test Task',
  dueDate: '2024-01-01',
  completed: false,
  createdAt: Date.now(),
  label: 'work'
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <TaskProvider>
      {ui}
    </TaskProvider>
  );
};

describe('TaskItem', () => {
  it('renders task description and label', async () => {
    renderWithProvider(
      <TaskItem 
        task={mockTask} 
        onToggle={vi.fn()} 
        onDelete={vi.fn()} 
        onEdit={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    // Labels are converted to lowercase in TaskProvider and displayed in UI
    expect(screen.getByText(/work/i)).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', () => {
    const onToggle = vi.fn();
    renderWithProvider(
      <TaskItem 
        task={mockTask} 
        onToggle={onToggle} 
        onDelete={vi.fn()} 
        onEdit={vi.fn()} 
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(onToggle).toHaveBeenCalledWith(mockTask.id);
  });

  it('applies completed styles when task is done', () => {
    const completedTask = { ...mockTask, completed: true };
    renderWithProvider(
      <TaskItem 
        task={completedTask} 
        onToggle={vi.fn()} 
        onDelete={vi.fn()} 
        onEdit={vi.fn()} 
      />
    );
    
    const description = screen.getByText('Test Task');
    expect(description.className).toContain('line-through');
  });
});
