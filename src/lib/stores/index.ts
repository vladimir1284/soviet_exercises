import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Types
export interface User {
  id: number;
  clerkId: string;
  email: string;
  name: string;
  locale: string;
  theme: 'system' | 'light' | 'dark';
}

export interface Exercise {
  id: number;
  userId: number;
  name: string;
  nameEn?: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Cycle {
  id: number;
  exerciseId: number;
  maxReps: number;
  repsPerSet: number;
  setsPerDay: number;
  daysPerWeek: number;
  durationWeeks: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
}

export interface SetLog {
  id: number;
  cycleId: number;
  repsCompleted: number;
  completedAt: string;
  editedAt?: string;
  dayNumber?: number;
  setNumber?: number;
  notes?: string;
}

export interface UserSettings {
  defaultSetsPerDay: number;
  defaultDaysPerWeek: number;
  defaultCycleWeeks: number;
  restDays: number[];
  notificationEnabled: boolean;
  notificationTime: string;
}

// User store
function createUserStore() {
  const { subscribe, set, update } = writable<User | null>(null);
  
  return {
    subscribe,
    set,
    update,
    signOut: () => set(null)
  };
}

export const user = createUserStore();

// Theme store
type Theme = 'system' | 'light' | 'dark';

function createThemeStore() {
  const stored = browser ? localStorage.getItem('theme') as Theme : null;
  const { subscribe, set } = writable<Theme>(stored || 'system');
  
  return {
    subscribe,
    set: (value: Theme) => {
      if (browser) {
        localStorage.setItem('theme', value);
        applyTheme(value);
      }
      set(value);
    }
  };
}

function applyTheme(theme: Theme) {
  if (!browser) return;
  
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (theme === 'dark' || (theme === 'system' && systemDark)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const theme = createThemeStore();

// Initialize theme on load
if (browser) {
  const stored = localStorage.getItem('theme') as Theme || 'system';
  applyTheme(stored);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = localStorage.getItem('theme') as Theme || 'system';
    if (current === 'system') {
      applyTheme('system');
    }
  });
}

// Exercises store
export const exercises = writable<Exercise[]>([]);

// Active cycles store
export const cycles = writable<Cycle[]>([]);

// Today's sets store
export const todaySets = writable<SetLog[]>([]);

// Settings store
export const settings = writable<UserSettings>({
  defaultSetsPerDay: 10,
  defaultDaysPerWeek: 5,
  defaultCycleWeeks: 2,
  restDays: [0, 6], // Sunday, Saturday
  notificationEnabled: true,
  notificationTime: '09:00'
});

// Derived stores
export const activeExercises = derived(exercises, $exercises => 
  $exercises.filter(e => e.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
);

export const activeCycles = derived(cycles, $cycles =>
  $cycles.filter(c => c.isActive)
);

// Helper to check if recalibration is needed
export function needsRecalibration(cycle: Cycle): boolean {
  if (!cycle.isActive) return false;
  
  const start = new Date(cycle.startDate);
  const now = new Date();
  const weeks = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  return weeks >= cycle.durationWeeks;
}

// Calculate progress for today
export const todayProgress = derived(
  [todaySets, activeCycles],
  ([$todaySets, $activeCycles]) => {
    const progress: Record<number, { completed: number; total: number }> = {};
    
    $activeCycles.forEach(cycle => {
      const setsForCycle = $todaySets.filter(s => s.cycleId === cycle.id);
      progress[cycle.exerciseId] = {
        completed: setsForCycle.length,
        total: cycle.setsPerDay
      };
    });
    
    return progress;
  }
);

// Loading state
export const isLoading = writable(true);

// Toast notifications
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);
  
  return {
    subscribe,
    add: (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2);
      update(toasts => [...toasts, { ...toast, id }]);
      
      setTimeout(() => {
        update(toasts => toasts.filter(t => t.id !== id));
      }, toast.duration || 3000);
    },
    remove: (id: string) => {
      update(toasts => toasts.filter(t => t.id !== id));
    }
  };
}

export const toasts = createToastStore();
