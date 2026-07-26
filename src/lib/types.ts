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
  
  // Timer Actions
  setWorkTimerActive: (active: boolean) => void;
  setBreakTimerActive: (active: boolean) => void;
  resetWorkTimer: () => void;
  resetBreakTimer: () => void;
  
  isInitialized: boolean;
}
