export type Priority = 'low' | 'medium' | 'high';

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Session {
  id: string;
  startTime: number;
  durationMinutes: number;
  type: 'work' | 'short';
  date: string; // YYYY-MM-DD
}

export interface Task {
  id: string;
  description: string;
  notes?: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: number;
  label?: string; // The name of the label
  priority?: Priority;
}

export interface TaskContextType {
  tasks: Task[];
  labels: Label[];
  sessions: Session[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addLabel: (name: string, color: string) => void;
  deleteLabel: (id: string) => void;
  addSession: (duration: number, type: 'work' | 'short') => void;
  isInitialized: boolean;
}
