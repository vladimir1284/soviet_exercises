import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'

// Types
export interface User {
  id: number
  clerkId: string
  email: string
  name: string
  locale: string
  theme: 'system' | 'light' | 'dark'
}

export interface Exercise {
  id: number
  userId: number
  name: string
  nameEn?: string
  icon: string
  color: string
  isActive: boolean
  sortOrder: number
  metrics?: ExerciseMetric[]
  setsCount: number
}

export interface ExerciseMetric {
  id: number
  exerciseId: number
  label: string
  unit: string | null
}

export interface Cycle {
  id: number
  exerciseId: number
  maxReps: number
  repsPerSet: number
  setsPerDay: number
  daysPerWeek: number
  durationWeeks: number
  startDate: string
  endDate?: string
  isActive: boolean
  notes?: string
  metricValues?: CycleMetricValue[]
}

export interface CycleMetricValue {
  id: number
  cycleId: number
  metricId: number
  value: string
  label?: string
  unit?: string | null
}

export interface SetLog {
  id: number
  cycleId: number
  repsCompleted: number
  completedAt: string
  editedAt?: string
  dayNumber?: number
  setNumber?: number
  notes?: string
  isPending?: boolean
}

export interface UserSettings {
  defaultSetsPerDay: number
  defaultDaysPerWeek: number
  defaultCycleWeeks: number
  restDays: number[]
  notificationEnabled: boolean
  notificationTime: string
}

// Helper for persisted stores
function createPersistedStore<T>(key: string, initialValue: T) {
  const stored = browser ? localStorage.getItem(key) : null
  const data = stored ? JSON.parse(stored) : initialValue
  const { subscribe, set, update } = writable<T>(data)

  return {
    subscribe,
    set: (value: T) => {
      if (browser) {
        if (value === null || value === undefined) {
          localStorage.removeItem(key)
        } else {
          localStorage.setItem(key, JSON.stringify(value))
        }
      }
      set(value)
    },
    update: (fn: (value: T) => T) => {
      update(current => {
        const newValue = fn(current)
        if (browser) {
          if (newValue === null || newValue === undefined) {
            localStorage.removeItem(key)
          } else {
            localStorage.setItem(key, JSON.stringify(newValue))
          }
        }
        return newValue
      })
    },
    reset: () => {
      if (browser) localStorage.removeItem(key)
      set(initialValue)
    },
  }
}

// User store
export const user = createPersistedStore<User | null>('user', null)

// Theme store
type Theme = 'system' | 'light' | 'dark'

function createThemeStore() {
  const stored = browser ? (localStorage.getItem('theme') as Theme) : null
  const { subscribe, set } = writable<Theme>(stored || 'system')

  return {
    subscribe,
    set: (value: Theme) => {
      if (browser) {
        localStorage.setItem('theme', value)
        applyTheme(value)
      }
      set(value)
    },
  }
}

function applyTheme(theme: Theme) {
  if (!browser) return

  const root = document.documentElement
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (theme === 'dark' || (theme === 'system' && systemDark)) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const theme = createThemeStore()

// Initialize theme on load
if (browser) {
  const stored = (localStorage.getItem('theme') as Theme) || 'system'
  applyTheme(stored)

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = (localStorage.getItem('theme') as Theme) || 'system'
    if (current === 'system') {
      applyTheme('system')
    }
  })
}

// Exercises store
export const exercises = createPersistedStore<Exercise[]>('exercises', [])

// Active cycles store
export const cycles = createPersistedStore<Cycle[]>('cycles', [])

// Today's sets store
export const todaySets = createPersistedStore<SetLog[]>('todaySets', [])

// Settings store
export const settings = createPersistedStore<UserSettings>('settings', {
  defaultSetsPerDay: 10,
  defaultDaysPerWeek: 5,
  defaultCycleWeeks: 2,
  restDays: [0, 6], // Sunday, Saturday
  notificationEnabled: true,
  notificationTime: '09:00',
})

// Offline support stores
export const isOnline = writable(browser ? navigator.onLine : true)

if (browser) {
  window.addEventListener('online', () => isOnline.set(true))
  window.addEventListener('offline', () => isOnline.set(false))
}

function createPendingSetsStore() {
  const stored = browser ? localStorage.getItem('pendingSets') : null
  const initialValue: Omit<SetLog, 'id'>[] = stored ? JSON.parse(stored) : []
  const { subscribe, set, update } = writable<Omit<SetLog, 'id'>[]>(initialValue)

  return {
    subscribe,
    add: (setLog: Omit<SetLog, 'id'>) => {
      update(sets => {
        const newSets = [...sets, setLog]
        if (browser) localStorage.setItem('pendingSets', JSON.stringify(newSets))
        return newSets
      })
    },
    clear: () => {
      set([])
      if (browser) localStorage.removeItem('pendingSets')
    },
    remove: (index: number) => {
      update(sets => {
        const newSets = sets.filter((_, i) => i !== index)
        if (browser) localStorage.setItem('pendingSets', JSON.stringify(newSets))
        return newSets
      })
    },
  }
}

export const pendingSets = createPendingSetsStore()

// Combined sets for today (synced + pending)
export const allTodaySets = derived([todaySets, pendingSets], ([$todaySets, $pendingSets]) => {
  // Convert pending sets to SetLog-like objects (without IDs)
  const pending = $pendingSets.map((s, i) => ({
    ...s,
    id: -(i + 1), // Negative IDs for pending sets
    isPending: true,
  }))
  return [...pending, ...$todaySets].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )
})

// Derived stores
export const activeExercises = derived(exercises, $exercises =>
  $exercises.filter(e => e.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
)

export const activeCycles = derived(cycles, $cycles => $cycles.filter(c => c.isActive))

// Helper to check if recalibration is needed
export function needsRecalibration(cycle: Cycle): boolean {
  if (!cycle.isActive) return false

  const start = new Date(cycle.startDate)
  const now = new Date()
  const weeks = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))

  return weeks >= cycle.durationWeeks
}

// Calculate progress for today
export const todayProgress = derived(
  [todaySets, pendingSets, activeCycles],
  ([$todaySets, $pendingSets, $activeCycles]) => {
    const progress: Record<number, { completed: number; pending: number; total: number }> = {}

    $activeCycles.forEach(cycle => {
      const setsForCycle = $todaySets.filter(s => s.cycleId === cycle.id)
      const pendingForCycle = $pendingSets.filter(s => s.cycleId === cycle.id)
      progress[cycle.exerciseId] = {
        completed: setsForCycle.length,
        pending: pendingForCycle.length,
        total: cycle.setsPerDay,
      }
    })

    return progress
  },
)

// Loading state
export const isLoading = writable(true)

// Toast notifications
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([])

  return {
    subscribe,
    add: (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2)
      update(toasts => [...toasts, { ...toast, id }])

      setTimeout(() => {
        update(toasts => toasts.filter(t => t.id !== id))
      }, toast.duration || 3000)
    },
    remove: (id: string) => {
      update(toasts => toasts.filter(t => t.id !== id))
    },
  }
}

export const toasts = createToastStore()

// Clear all data on logout
export function clearAllData() {
  user.reset()
  exercises.reset()
  cycles.reset()
  todaySets.reset()
  settings.reset()
  pendingSets.clear()
}
