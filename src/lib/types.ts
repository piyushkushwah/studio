export interface Task {
  id: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: number;
  label?: string;
}

export interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
}
