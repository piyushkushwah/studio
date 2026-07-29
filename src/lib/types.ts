
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

export type RoutineFrequency = 'daily' | 'weekly' | 'weekdays' | 'weekends';

export interface Routine {
  id: string;
  title: string;
  description?: string;
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  frequency: RoutineFrequency;
  days?: string[]; // e.g. ["Monday", "Wednesday"]
  active: boolean;
  createdAt: number;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export type GrowthNoteType = 'reflection' | 'gratitude' | 'affirmation' | 'lesson';

export interface GrowthNote {
  id: string;
  content: string;
  type: GrowthNoteType;
  source?: string; // Guru name or Book name
  date: string; // YYYY-MM-DD
  createdAt: number;
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

export interface DietEntry {
  id: string;
  name: string;
  calories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface WaterEntry {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface Exercise {
  id: string;
  name: string;
  durationMinutes: number;
  caloriesBurned: number;
  type: 'cardio' | 'strength' | 'flexibility' | 'other';
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface TravelGoal {
  id: string;
  destination: string;
  plannedDate?: string; // YYYY-MM-DD
  budget?: number;
  status: 'planned' | 'bucket-list' | 'completed';
  notes?: string;
  packingList?: string[];
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
  routines: Routine[];
  labels: Label[];
  sessions: Session[];
  notes: Note[];
  growthNotes: GrowthNote[];
  expenses: Expense[];
  diet: DietEntry[];
  water: WaterEntry[];
  exercises: Exercise[];
  travelGoals: TravelGoal[];
  dailyGoals: Record<string, number>;
  customSongs: CustomSong[];
  streak: number;
  
  waterGoal: number;
  calorieGoal: number;
  height: number;
  weight: number;
  
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
  
  addRoutine: (routineData: Omit<Routine, 'id' | 'createdAt'>) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  
  addLabel: (name: string, color: string) => void;
  deleteLabel: (id: string) => void;
  addSession: (duration: number, type: 'work' | 'short' | 'manual', note?: string, date?: string) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  setDailyGoal: (date: string, target: number) => void;
  setWaterGoal: (target: number) => void;
  setCalorieGoal: (target: number) => void;
  setPhysicalProfile: (height: number, weight: number) => void;
  addCustomSong: (label: string, url: string) => void;
  removeCustomSong: (id: string) => void;
  
  // Note Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Growth Note Actions
  addGrowthNote: (note: Omit<GrowthNote, 'id' | 'createdAt'>) => void;
  updateGrowthNote: (id: string, updates: Partial<GrowthNote>) => void;
  deleteGrowthNote: (id: string) => void;

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Health Actions
  addDietEntry: (entry: Omit<DietEntry, 'id' | 'createdAt'>) => void;
  deleteDietEntry: (id: string) => void;
  addWaterEntry: (amount: number, date?: string) => void;
  deleteWaterEntry: (id: string) => void;

  // Exercise Actions
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
  deleteExercise: (id: string) => void;

  // Travel Actions
  addTravelGoal: (goal: Omit<TravelGoal, 'id' | 'createdAt'>) => void;
  updateTravelGoal: (id: string, updates: Partial<TravelGoal>) => void;
  deleteTravelGoal: (id: string) => void;
  
  // Timer Actions
  setWorkTimerActive: (active: boolean) => void;
  setBreakTimerActive: (active: boolean) => void;
  resetWorkTimer: () => void;
  resetBreakTimer: () => void;
  
  isInitialized: boolean;
}
