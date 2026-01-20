import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { queries, formatDbExercise, formatDbCycle, formatDbSet } from '$db'

export const POST: RequestHandler = async ({ request, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    const { clerkId, email, name } = await request.json()

    // Get or create user
    let user = await queries.getUserByClerkId(db, clerkId)

    if (!user) {
      user = await queries.createUser(db, clerkId, email, name)
      // Create default settings
      await queries.createSettings(db, user!.id)
    }

    if (!user) {
      return json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Get user's exercises
    const exercisesResult = await queries.getExercisesByUser(db, user.id)
    const exercises = (exercisesResult.results || []).map(formatDbExercise)

    // Get active cycles
    const cyclesResult = await queries.getActiveCyclesByUser(db, user.id)
    const cycles = (cyclesResult.results || []).map(formatDbCycle)

    // Get today's sets
    const todaySetsResult = await queries.getTodaySetsByUser(db, user.id)
    const todaySets = (todaySetsResult.results || []).map(formatDbSet)

    // Get settings
    const settingsDb = await queries.getSettingsByUser(db, user.id)
    const settings = settingsDb
      ? {
          defaultSetsPerDay: settingsDb.default_sets_per_day,
          defaultDaysPerWeek: settingsDb.default_days_per_week,
          defaultCycleWeeks: settingsDb.default_cycle_weeks,
          restDays: JSON.parse(settingsDb.rest_days || '[]'),
          notificationEnabled: settingsDb.notification_enabled === 1,
          notificationTime: settingsDb.notification_time,
        }
      : null

    return json({
      user: {
        id: user.id,
        clerkId: user.clerk_id,
        email: user.email,
        name: user.name,
        locale: user.locale,
        theme: user.theme,
      },
      exercises,
      cycles,
      todaySets,
      settings,
    })
  } catch (error) {
    console.error('User init error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
