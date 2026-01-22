import type { D1Database } from '@cloudflare/workers-types'
import { getLocalISOString, getLocalDateString } from '../utils/date'

export interface DbUser {
  id: number
  clerk_id: string
  email: string | null
  name: string | null
  locale: string
  theme: string
  created_at: string
  updated_at: string
}

export interface DbExercise {
  id: number
  user_id: number
  name: string
  name_en: string | null
  icon: string
  color: string
  is_active: number
  sort_order: number
  created_at: string
}

export interface DbCycle {
  id: number
  exercise_id: number
  max_reps: number
  reps_per_set: number
  sets_per_day: number
  days_per_week: number
  duration_weeks: number
  start_date: string
  end_date: string | null
  is_active: number
  notes: string | null
  created_at: string
}

export interface DbSet {
  id: number
  cycle_id: number
  reps_completed: number
  completed_at: string
  edited_at: string | null
  day_number: number | null
  set_number: number | null
  notes: string | null
  created_at: string
}

export interface DbUserSettings {
  id: number
  user_id: number
  default_sets_per_day: number
  default_days_per_week: number
  default_cycle_weeks: number
  rest_days: string
  notification_enabled: number
  notification_time: string
  created_at: string
  updated_at: string
}

// Database queries
export const queries = {
  // Users
  getUserByClerkId: (db: D1Database, clerkId: string) =>
    db.prepare('SELECT * FROM users WHERE clerk_id = ?').bind(clerkId).first<DbUser>(),

  createUser: (db: D1Database, clerkId: string, email?: string, name?: string) =>
    db
      .prepare('INSERT INTO users (clerk_id, email, name) VALUES (?, ?, ?) RETURNING *')
      .bind(clerkId, email || null, name || null)
      .first<DbUser>(),

  updateUser: (db: D1Database, id: number, data: Partial<Pick<DbUser, 'email' | 'name' | 'locale' | 'theme'>>) => {
    const fields = Object.keys(data).filter(k => data[k as keyof typeof data] !== undefined)
    const values = fields.map(k => data[k as keyof typeof data])
    const setClause = fields.map(f => `${f} = ?`).join(', ')
    return db
      .prepare(`UPDATE users SET ${setClause} WHERE id = ? RETURNING *`)
      .bind(...values, id)
      .first<DbUser>()
  },

  // Exercises
  getExercisesByUser: (db: D1Database, userId: number) =>
    db
      .prepare('SELECT * FROM exercises WHERE user_id = ? ORDER BY sort_order, created_at')
      .bind(userId)
      .all<DbExercise>(),

  getExerciseById: (db: D1Database, id: number) =>
    db.prepare('SELECT * FROM exercises WHERE id = ?').bind(id).first<DbExercise>(),

  createExercise: (db: D1Database, userId: number, name: string, icon: string, color: string) =>
    db
      .prepare('INSERT INTO exercises (user_id, name, icon, color) VALUES (?, ?, ?, ?) RETURNING *')
      .bind(userId, name, icon, color)
      .first<DbExercise>(),

  updateExercise: (
    db: D1Database,
    id: number,
    data: Partial<Pick<DbExercise, 'name' | 'name_en' | 'icon' | 'color' | 'is_active' | 'sort_order'>>,
  ) => {
    const fields = Object.keys(data).filter(k => data[k as keyof typeof data] !== undefined)
    const values = fields.map(k => data[k as keyof typeof data])
    const setClause = fields.map(f => `${f} = ?`).join(', ')
    return db
      .prepare(`UPDATE exercises SET ${setClause} WHERE id = ? RETURNING *`)
      .bind(...values, id)
      .first<DbExercise>()
  },

  deleteExercise: (db: D1Database, id: number) => db.prepare('DELETE FROM exercises WHERE id = ?').bind(id).run(),

  // Cycles
  getCyclesByExercise: (db: D1Database, exerciseId: number) =>
    db.prepare('SELECT * FROM cycles WHERE exercise_id = ? ORDER BY created_at DESC').bind(exerciseId).all<DbCycle>(),

  getActiveCyclesByUser: async (db: D1Database, userId: number) => {
    const result = await db
      .prepare(
        `
      SELECT c.* FROM cycles c
      JOIN exercises e ON c.exercise_id = e.id
      WHERE e.user_id = ? AND c.is_active = 1
    `,
      )
      .bind(userId)
      .all<DbCycle>()
    return result
  },

  getCycleById: (db: D1Database, id: number) =>
    db.prepare('SELECT * FROM cycles WHERE id = ?').bind(id).first<DbCycle>(),

  createCycle: (
    db: D1Database,
    data: {
      exerciseId: number
      maxReps: number
      repsPerSet: number
      setsPerDay: number
      daysPerWeek: number
      durationWeeks: number
      startDate: string
    },
  ) =>
    db
      .prepare(
        `
      INSERT INTO cycles (exercise_id, max_reps, reps_per_set, sets_per_day, days_per_week, duration_weeks, start_date)
      VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *
    `,
      )
      .bind(
        data.exerciseId,
        data.maxReps,
        data.repsPerSet,
        data.setsPerDay,
        data.daysPerWeek,
        data.durationWeeks,
        data.startDate,
      )
      .first<DbCycle>(),

  deactivateCycle: (db: D1Database, id: number) =>
    db
      .prepare('UPDATE cycles SET is_active = 0, end_date = ? WHERE id = ? RETURNING *')
      .bind(getLocalISOString(), id)
      .first<DbCycle>(),

  // Sets
  getSetsByCycle: (db: D1Database, cycleId: number) =>
    db.prepare('SELECT * FROM sets WHERE cycle_id = ? ORDER BY completed_at DESC').bind(cycleId).all<DbSet>(),

  getTodaySetsByUser: async (db: D1Database, userId: number, localDate?: string) => {
    const today = localDate || getLocalDateString()
    const result = await db
      .prepare(
        `
      SELECT s.* FROM sets s
      JOIN cycles c ON s.cycle_id = c.id
      JOIN exercises e ON c.exercise_id = e.id
      WHERE e.user_id = ? AND DATE(s.completed_at) = ?
      ORDER BY s.completed_at DESC
    `,
      )
      .bind(userId, today)
      .all<DbSet>()
    return result
  },

  getSetsByDateRange: async (db: D1Database, userId: number, startDate: string, endDate: string) => {
    const result = await db
      .prepare(
        `
      SELECT s.*, c.exercise_id FROM sets s
      JOIN cycles c ON s.cycle_id = c.id
      JOIN exercises e ON c.exercise_id = e.id
      WHERE e.user_id = ? AND DATE(s.completed_at) BETWEEN ? AND ?
      ORDER BY s.completed_at DESC
    `,
      )
      .bind(userId, startDate, endDate)
      .all<DbSet & { exercise_id: number }>()
    return result
  },

  createSet: (db: D1Database, cycleId: number, repsCompleted: number, completedAt?: string, notes?: string) =>
    db
      .prepare(
        `
      INSERT INTO sets (cycle_id, reps_completed, completed_at, notes)
      VALUES (?, ?, ?, ?) RETURNING *
    `,
      )
      .bind(cycleId, repsCompleted, completedAt || getLocalISOString(), notes || null)
      .first<DbSet>(),

  updateSet: (db: D1Database, id: number, data: { completedAt?: string; notes?: string }) =>
    db
      .prepare(
        `
      UPDATE sets SET completed_at = COALESCE(?, completed_at), notes = COALESCE(?, notes), edited_at = ?
      WHERE id = ? RETURNING *
    `,
      )
      .bind(data.completedAt || null, data.notes || null, getLocalISOString(), id)
      .first<DbSet>(),

  deleteSet: (db: D1Database, id: number) => db.prepare('DELETE FROM sets WHERE id = ?').bind(id).run(),

  // User Settings
  getSettingsByUser: (db: D1Database, userId: number) =>
    db.prepare('SELECT * FROM user_settings WHERE user_id = ?').bind(userId).first<DbUserSettings>(),

  createSettings: (db: D1Database, userId: number) =>
    db.prepare('INSERT INTO user_settings (user_id) VALUES (?) RETURNING *').bind(userId).first<DbUserSettings>(),

  updateSettings: (
    db: D1Database,
    userId: number,
    data: Partial<Omit<DbUserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
  ) => {
    const fields = Object.keys(data).filter(k => data[k as keyof typeof data] !== undefined)
    const values = fields.map(k => data[k as keyof typeof data])
    const setClause = fields.map(f => `${f} = ?`).join(', ')
    return db
      .prepare(`UPDATE user_settings SET ${setClause} WHERE user_id = ? RETURNING *`)
      .bind(...values, userId)
      .first<DbUserSettings>()
  },

  // Stats
  getTotalStats: async (db: D1Database, userId: number) => {
    const result = await db
      .prepare(
        `
      SELECT 
        COUNT(s.id) as total_sets,
        SUM(s.reps_completed) as total_reps,
        COUNT(DISTINCT DATE(s.completed_at)) as active_days
      FROM sets s
      JOIN cycles c ON s.cycle_id = c.id
      JOIN exercises e ON c.exercise_id = e.id
      WHERE e.user_id = ?
    `,
      )
      .bind(userId)
      .first<{ total_sets: number; total_reps: number; active_days: number }>()
    return result
  },

  getStatsForPeriod: async (db: D1Database, userId: number, startDate: string, endDate: string) => {
    const result = await db
      .prepare(
        `
      SELECT 
        e.id as exercise_id,
        e.name as exercise_name,
        COUNT(s.id) as sets_count,
        SUM(s.reps_completed) as total_reps
      FROM sets s
      JOIN cycles c ON s.cycle_id = c.id
      JOIN exercises e ON c.exercise_id = e.id
      WHERE e.user_id = ? AND DATE(s.completed_at) BETWEEN ? AND ?
      GROUP BY e.id
    `,
      )
      .bind(userId, startDate, endDate)
      .all<{
        exercise_id: number
        exercise_name: string
        sets_count: number
        total_reps: number
      }>()
    return result
  },
}

// Helper functions
export function toBoolean(value: number | null): boolean {
  return value === 1
}

export function fromBoolean(value: boolean): number {
  return value ? 1 : 0
}

export function formatDbExercise(db: DbExercise) {
  return {
    id: db.id,
    userId: db.user_id,
    name: db.name,
    nameEn: db.name_en,
    icon: db.icon,
    color: db.color,
    isActive: toBoolean(db.is_active),
    sortOrder: db.sort_order,
  }
}

export function formatDbCycle(db: DbCycle) {
  return {
    id: db.id,
    exerciseId: db.exercise_id,
    maxReps: db.max_reps,
    repsPerSet: db.reps_per_set,
    setsPerDay: db.sets_per_day,
    daysPerWeek: db.days_per_week,
    durationWeeks: db.duration_weeks,
    startDate: db.start_date,
    endDate: db.end_date,
    isActive: toBoolean(db.is_active),
    notes: db.notes,
  }
}

export function formatDbSet(db: DbSet) {
  return {
    id: db.id,
    cycleId: db.cycle_id,
    repsCompleted: db.reps_completed,
    completedAt: db.completed_at,
    editedAt: db.edited_at,
    dayNumber: db.day_number,
    setNumber: db.set_number,
    notes: db.notes,
  }
}
