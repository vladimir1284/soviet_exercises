import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { queries, formatDbExercise } from '$db'

// Get all exercises for user
export const GET: RequestHandler = async ({ url, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const userId = url.searchParams.get('userId')
  if (!userId) {
    return json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    const result = await queries.getExercisesByUser(db, parseInt(userId))
    const exercises = (result.results || []).map(formatDbExercise)
    return json(exercises)
  } catch (error) {
    console.error('Get exercises error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new exercise
export const POST: RequestHandler = async ({ request, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    const { userId, name, icon, color } = await request.json()

    if (!userId || !name) {
      return json({ error: 'User ID and name required' }, { status: 400 })
    }

    const exercise = await queries.createExercise(db, userId, name, icon || '💪', color || '#6366f1')

    if (!exercise) {
      return json({ error: 'Failed to create exercise' }, { status: 500 })
    }

    return json(formatDbExercise(exercise))
  } catch (error) {
    console.error('Create exercise error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
