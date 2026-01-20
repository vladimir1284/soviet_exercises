import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { queries, formatDbSet } from '$db'

// Update set
export const PATCH: RequestHandler = async ({ params, request, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const id = parseInt(params.id)
  if (isNaN(id)) {
    return json({ error: 'Invalid set ID' }, { status: 400 })
  }

  try {
    const { completedAt, notes } = await request.json()

    const set = await queries.updateSet(db, id, { completedAt, notes })

    if (!set) {
      return json({ error: 'Set not found' }, { status: 404 })
    }

    return json(formatDbSet(set))
  } catch (error) {
    console.error('Update set error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete set
export const DELETE: RequestHandler = async ({ params, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const id = parseInt(params.id)
  if (isNaN(id)) {
    return json({ error: 'Invalid set ID' }, { status: 400 })
  }

  try {
    await queries.deleteSet(db, id)
    return json({ success: true })
  } catch (error) {
    console.error('Delete set error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
