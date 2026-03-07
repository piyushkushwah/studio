export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: number;
  label?: string; // The name of the label
}

export interface TaskStore {
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
