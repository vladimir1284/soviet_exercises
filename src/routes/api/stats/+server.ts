import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { D1Database } from '@cloudflare/workers-types'
import { queries } from '$db'
import { getLocalDateString } from '$lib/utils/date'

interface WeekStats {
  date: string
  sets: number
}

interface WeekEvaluation {
  weekStart: string
  weekEnd: string
  targetDays: number
  completedDays: number
  status: 'green' | 'orange' | 'red'
  exerciseId: number
}

export const GET: RequestHandler = async ({ url, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const userId = url.searchParams.get('userId')
  const timezoneOffsetStr = url.searchParams.get('timezoneOffset')
  const timezoneOffset = timezoneOffsetStr ? parseInt(timezoneOffsetStr) : undefined

  if (!userId) {
    return json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    // Get total stats
    const totalStats = await queries.getTotalStats(db, parseInt(userId), timezoneOffset)

    // Get last 7 days stats
    const localDate = url.searchParams.get('localDate') || getLocalDateString()
    const today = new Date(localDate + 'T12:00:00') // Use noon to avoid DST issues
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 6)

    const weekStats: WeekStats[] = []
    const offsetModifier = timezoneOffset !== undefined ? `, '${timezoneOffset} minutes'` : ''

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekAgo)
      date.setDate(date.getDate() + i)
      const dateStr = getLocalDateString(date)

      // Count sets for this day
      const dayResult = await db
        .prepare(
          `
        SELECT COUNT(*) as count FROM sets s
        JOIN cycles c ON s.cycle_id = c.id
        JOIN exercises e ON c.exercise_id = e.id
        WHERE e.user_id = ? AND DATE(s.completed_at${offsetModifier}) = ?
      `,
        )
        .bind(parseInt(userId), dateStr)
        .first<{ count: number }>()

      weekStats.push({
        date: dateStr,
        sets: dayResult?.count || 0,
      })
    }

    // Calculate streaks
    const { currentStreak, bestStreak } = await calculateStreaks(db, parseInt(userId), localDate, timezoneOffset)

    // Get cycle history with max reps progression
    const cycleHistory = await db
      .prepare(
        `
      SELECT c.id, e.name as exercise_name, c.max_reps, c.start_date, c.end_date
      FROM cycles c
      JOIN exercises e ON c.exercise_id = e.id
      WHERE e.user_id = ?
      ORDER BY c.start_date DESC
      LIMIT 20
    `,
      )
      .bind(parseInt(userId))
      .all<{
        id: number
        exercise_name: string
        max_reps: number
        start_date: string
        end_date: string | null
      }>()

    // Get weekly evaluations
    const weekEvaluations = await getWeeklyEvaluations(db, parseInt(userId), timezoneOffset)

    return json({
      stats: {
        totalSets: totalStats?.total_sets || 0,
        totalReps: totalStats?.total_reps || 0,
        activeDays: totalStats?.active_days || 0,
        currentStreak,
        bestStreak,
      },
      weekStats,
      cycleHistory: (cycleHistory.results || []).map((c: any) => ({
        id: c.id,
        exerciseName: c.exercise_name,
        maxReps: c.max_reps,
        startDate: c.start_date,
        endDate: c.end_date,
      })),
      weekEvaluations,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function calculateStreaks(
  db: D1Database,
  userId: number,
  localDate: string,
  timezoneOffset?: number,
): Promise<{ currentStreak: number; bestStreak: number }> {
  // Get all days with at least one set, ordered by date desc
  const offsetModifier = timezoneOffset !== undefined ? `, '${timezoneOffset} minutes'` : ''
  const result = await db
    .prepare(
      `
    SELECT DISTINCT DATE(s.completed_at${offsetModifier}) as day
    FROM sets s
    JOIN cycles c ON s.cycle_id = c.id
    JOIN exercises e ON c.exercise_id = e.id
    WHERE e.user_id = ?
    ORDER BY day DESC
  `,
    )
    .bind(userId)
    .all<{ day: string }>()

  const days = result.results || []

  if (days.length === 0) {
    return { currentStreak: 0, bestStreak: 0 }
  }

  let currentStreak = 0
  let bestStreak = 0
  let tempStreak = 0
  let prevDate: Date | null = null

  const today = new Date(localDate + 'T12:00:00')
  today.setHours(0, 0, 0, 0)

  for (const { day } of days) {
    const date = new Date(day)
    date.setHours(0, 0, 0, 0)

    if (prevDate === null) {
      // First day
      const diffFromToday = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      if (diffFromToday <= 1) {
        tempStreak = 1
        currentStreak = 1
      } else {
        tempStreak = 1
      }
    } else {
      const diff = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        tempStreak++
        if (currentStreak > 0) {
          currentStreak = tempStreak
        }
      } else {
        bestStreak = Math.max(bestStreak, tempStreak)
        tempStreak = 1
      }
    }

    prevDate = date
  }

  bestStreak = Math.max(bestStreak, tempStreak)

  return { currentStreak, bestStreak }
}

async function getWeeklyEvaluations(
  db: D1Database,
  userId: number,
  timezoneOffset?: number,
): Promise<WeekEvaluation[]> {
  // Get user settings for week start
  const settings = await db
    .prepare(
      `
    SELECT default_days_per_week FROM user_settings WHERE user_id = ?
  `,
    )
    .bind(userId)
    .first<{ default_days_per_week: number }>()

  const targetDays = settings?.default_days_per_week || 5

  // Get active cycles
  const cycles = await db
    .prepare(
      `
    SELECT c.id, c.exercise_id, c.start_date, c.days_per_week
    FROM cycles c
    JOIN exercises e ON c.exercise_id = e.id
    WHERE e.user_id = ? AND c.is_active = 1
  `,
    )
    .bind(userId)
    .all<{
      id: number
      exercise_id: number
      start_date: string
      days_per_week: number
    }>()

  const evaluations: WeekEvaluation[] = []

  for (const cycle of cycles.results || []) {
    const startDate = new Date(cycle.start_date)
    const localDate = getLocalDateString()
    const now = new Date(localDate + 'T23:59:59')

    // Calculate weeks since start
    let weekStart = new Date(startDate)

    while (weekStart < now) {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      // Only evaluate completed weeks
      if (weekEnd < now) {
        // Count days with at least one set this week
        const offsetModifier = timezoneOffset !== undefined ? `, '${timezoneOffset} minutes'` : ''
        const daysResult = await db
          .prepare(
            `
          SELECT COUNT(DISTINCT DATE(completed_at${offsetModifier})) as days
          FROM sets
          WHERE cycle_id = ? 
            AND DATE(completed_at${offsetModifier}) >= ? 
            AND DATE(completed_at${offsetModifier}) <= ?
        `,
          )
          .bind(cycle.id, getLocalDateString(weekStart), getLocalDateString(weekEnd))
          .first<{ days: number }>()

        const completedDays = daysResult?.days || 0
        const target = cycle.days_per_week

        let status: 'green' | 'orange' | 'red'
        if (completedDays >= target) {
          status = 'green'
        } else if (completedDays >= target - 1) {
          status = 'orange'
        } else {
          status = 'red'
        }

        evaluations.push({
          weekStart: getLocalDateString(weekStart),
          weekEnd: getLocalDateString(weekEnd),
          targetDays: target,
          completedDays,
          status,
          exerciseId: cycle.exercise_id,
        })
      }

      weekStart.setDate(weekStart.getDate() + 7)
    }
  }

  return evaluations.sort((a, b) => b.weekStart.localeCompare(a.weekStart))
}
