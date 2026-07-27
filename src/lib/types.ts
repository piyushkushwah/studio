
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
  type: 'work' | 'short' | 'manual';
  date: string; // YYYY-MM-DD
  note?: string;
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

export interface Note {
  id: string;
  title?: string;
  content: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface DailyGoal {
  date: string; // YYYY-MM-DD
  targetTasks: number;
}

export interface CustomSong {
  id: string;
  label: string;
  url: string;
}

export type TimerMode = "work" | "short";

export interface TaskContextType {
  // Data
  tasks: Task[];
  labels: Label[];
  sessions: Session[];
  notes: Note[];
  expenses: Expense[];
  dailyGoals: Record<string, number>;
  customSongs: CustomSong[];
  streak: number;
  
  // Timer State (Separated)
  workTimerLeft: number;
  breakTimerLeft: number;
  isWorkTimerActive: boolean;
  isBreakTimerActive: boolean;
  
  // Actions
  addTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addLabel: (name: string, color: string) => void;
  deleteLabel: (id: string) => void;
  addSession: (duration: number, type: 'work' | 'short' | 'manual', note?: string, date?: string) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  setDailyGoal: (date: string, target: number) => void;
  addCustomSong: (label: string, url: string) => void;
  removeCustomSong: (id: string) => void;
  
  // Note Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Timer Actions
  setWorkTimerActive: (active: boolean) => void;
  setBreakTimerActive: (active: boolean) => void;
  resetWorkTimer: () => void;
  resetBreakTimer: () => void;
  
  isInitialized: boolean;
}
