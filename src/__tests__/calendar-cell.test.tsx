
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarCell } from '@/components/calendar-cell';
import { Task } from '@/lib/types';
import { format } from 'date-fns';
import { describe, it, expect, vi } from 'vitest';

const mockDate = new Date(2024, 0, 15); // Jan 15, 2024
const mockCurrentMonth = new Date(2024, 0, 1);
const dateStr = format(mockDate, 'yyyy-MM-dd');

const mockTasks: Task[] = [
  { id: '1', description: 'Task 1', dueDate: dateStr, completed: false, createdAt: Date.now() },
  { id: '2', description: 'Task 2', dueDate: dateStr, completed: true, createdAt: Date.now() },
];

describe('CalendarCell', () => {
  it('renders the day number', () => {
    render(
      <CalendarCell
        date={mockDate}
        currentMonth={mockCurrentMonth}
        isSelected={false}
        tasks={[]}
        onClick={vi.fn()}
      />
    );
    
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('calls onClick when pressed', () => {
    const onClick = vi.fn();
    render(
      <CalendarCell
        date={mockDate}
        currentMonth={mockCurrentMonth}
        isSelected={false}
        tasks={[]}
        onClick={onClick}
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows indicator dots for tasks', () => {
    const { container } = render(
      <CalendarCell
        date={mockDate}
        currentMonth={mockCurrentMonth}
        isSelected={false}
        tasks={mockTasks}
        onClick={vi.fn()}
      />
    );
    
    // Indicator dots use 'rounded-full' class
    const indicators = container.querySelectorAll('.rounded-full');
    expect(indicators.length).toBeGreaterThanOrEqual(2);
  });

  it('highlights selection', () => {
    render(
      <CalendarCell
        date={mockDate}
        currentMonth={mockCurrentMonth}
        isSelected={true}
        tasks={[]}
        onClick={vi.fn()}
      />
    );
    
    const button = screen.getByRole('button');
    // Check for primary color or ring which indicates selection
    expect(button.className).toContain('ring-primary');
  });
});
