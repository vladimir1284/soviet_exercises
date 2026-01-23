import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { queries, formatDbExercise, fromBoolean } from '$db'

// Get single exercise
export const GET: RequestHandler = async ({ params, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const id = parseInt(params.id)
  if (isNaN(id)) {
    return json({ error: 'Invalid exercise ID' }, { status: 400 })
  }

  try {
    const exercise = await queries.getExerciseById(db, id)
    if (!exercise) {
      return json({ error: 'Exercise not found' }, { status: 404 })
    }

    return json(formatDbExercise(exercise))
  } catch (error) {
    console.error('Get exercise error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update exercise
export const PATCH: RequestHandler = async ({ params, request, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const id = parseInt(params.id)
  if (isNaN(id)) {
    return json({ error: 'Invalid exercise ID' }, { status: 400 })
  }

  try {
    const data = await request.json()

    // Convert boolean to number for DB
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.nameEn !== undefined) updateData.name_en = data.nameEn
    if (data.icon !== undefined) updateData.icon = data.icon
    if (data.color !== undefined) updateData.color = data.color
    if (data.isActive !== undefined) updateData.is_active = fromBoolean(data.isActive)
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder

    const exercise = await queries.updateExercise(db, id, updateData)

    if (!exercise) {
      return json({ error: 'Exercise not found' }, { status: 404 })
    }

    return json(formatDbExercise(exercise))
  } catch (error) {
    console.error('Update exercise error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete exercise
export const DELETE: RequestHandler = async ({ params, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const id = parseInt(params.id)
  if (isNaN(id)) {
    return json({ error: 'Invalid exercise ID' }, { status: 400 })
  }

  try {
    // Check if exercise has sets
    const setsCount = await queries.countSetsByExercise(db, id)
    if (setsCount > 0) {
      return json({ error: 'Cannot delete exercise with registered sets' }, { status: 400 })
    }

    await queries.deleteExercise(db, id)
    return json({ success: true })
  } catch (error) {
    console.error('Delete exercise error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
