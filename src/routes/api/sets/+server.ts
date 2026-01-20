import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { queries, formatDbSet } from '$db'

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

    const set = await queries.createSet(db, cycleId, repsCompleted, completedAt || new Date().toISOString(), notes)

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

  const cycleId = url.searchParams.get('cycleId')
  if (!cycleId) {
    return json({ error: 'Cycle ID required' }, { status: 400 })
  }

  try {
    const result = await queries.getSetsByCycle(db, parseInt(cycleId))
    const sets = (result.results || []).map(formatDbSet)
    return json(sets)
  } catch (error) {
    console.error('Get sets error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
