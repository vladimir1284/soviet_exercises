import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { queries, formatDbSet } from '$db'
import { getLocalISOString } from '$lib/utils/date'

// Create new set
export const POST: RequestHandler = async ({ request, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    const { cycleId, repsCompleted, completedAt, notes } = await request.json()

    if (!cycleId || repsCompleted === undefined) {
      return json({ error: 'Cycle ID and reps required' }, { status: 400 })
    }

    const set = await queries.createSet(db, cycleId, repsCompleted, completedAt || getLocalISOString(), notes)

    if (!set) {
      return json({ error: 'Failed to create set' }, { status: 500 })
    }

    return json(formatDbSet(set))
  } catch (error) {
    console.error('Create set error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get sets for cycle
export const GET: RequestHandler = async ({ url, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    const userId = url.searchParams.get('userId')
    const date = url.searchParams.get('date')
    const timezoneOffset = url.searchParams.get('timezoneOffset')

    if (userId && date) {
      // Get sets for specific date
      const result = await queries.getTodaySetsByUser(
        db,
        parseInt(userId),
        date,
        timezoneOffset ? parseInt(timezoneOffset) : undefined,
      )
      const sets = (result.results || []).map(formatDbSet)
      return json(sets)
    }

    const cycleId = url.searchParams.get('cycleId')
    if (!cycleId) {
      return json({ error: 'Cycle ID or User ID + Date required' }, { status: 400 })
    }

    const result = await queries.getSetsByCycle(db, parseInt(cycleId))
    const sets = (result.results || []).map(formatDbSet)
    return json(sets)
  } catch (error) {
    console.error('Get sets error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
