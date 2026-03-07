
import { render, screen, fireEvent } from '@testing-library/react';
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
  it('renders task description and label', () => {
    renderWithProvider(
      <TaskItem 
        task={mockTask} 
        onToggle={vi.fn()} 
        onDelete={vi.fn()} 
        onEdit={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Test Task')).toBeDefined();
    expect(screen.getByText('work')).toBeDefined();
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

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    renderWithProvider(
      <TaskItem 
        task={mockTask} 
        onToggle={vi.fn()} 
        onDelete={onDelete} 
        onEdit={vi.fn()} 
      />
    );
    
    // Find button by icon or test-id if available, using label for now
    // Since it's a ghost button with just an icon, we can find it by its container
    const buttons = screen.getAllByRole('button');
    // The second button is delete in TaskItem
    fireEvent.click(buttons[1]);
    
    expect(onDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    renderWithProvider(
      <TaskItem 
        task={mockTask} 
        onToggle={vi.fn()} 
        onDelete={vi.fn()} 
        onEdit={onEdit} 
      />
    );
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    
    expect(onEdit).toHaveBeenCalledWith(mockTask);
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
