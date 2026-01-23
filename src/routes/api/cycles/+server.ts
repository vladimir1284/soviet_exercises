import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { queries, formatDbCycle } from '$db'
import { getLocalISOString } from '$lib/utils/date'

// Create new cycle (and deactivate previous one for same exercise)
export const POST: RequestHandler = async ({ request, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    const { exerciseId, maxReps, repsPerSet, setsPerDay, daysPerWeek, durationWeeks, metricValues } = await request.json()

    if (!exerciseId || !maxReps) {
      return json({ error: 'Exercise ID and max reps required' }, { status: 400 })
    }

    // Deactivate any existing active cycle for this exercise
    const existingCycles = await queries.getCyclesByExercise(db, exerciseId)
    for (const cycle of existingCycles.results || []) {
      if (cycle.is_active) {
        await queries.deactivateCycle(db, cycle.id)
      }
    }

    // Create new cycle
    const today = getLocalISOString()
    const cycle = await queries.createCycle(db, {
      exerciseId,
      maxReps,
      repsPerSet: repsPerSet || Math.floor(maxReps / 2),
      setsPerDay: setsPerDay || 10,
      daysPerWeek: daysPerWeek || 5,
      durationWeeks: durationWeeks || 2,
      startDate: today,
    })

    if (!cycle) {
      return json({ error: 'Failed to create cycle' }, { status: 500 })
    }

    // Save metric values if provided
    if (metricValues && Array.isArray(metricValues)) {
      for (const mv of metricValues) {
        if (mv.metricId && mv.value !== undefined) {
          await queries.createMetricValue(db, cycle.id, mv.metricId, String(mv.value))
        }
      }
    }

    return json(formatDbCycle(cycle))
  } catch (error) {
    console.error('Create cycle error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get cycles for exercise
export const GET: RequestHandler = async ({ url, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const exerciseId = url.searchParams.get('exerciseId')
  if (!exerciseId) {
    return json({ error: 'Exercise ID required' }, { status: 400 })
  }

  try {
    const result = await queries.getCyclesByExercise(db, parseInt(exerciseId))
    const cycles = (result.results || []).map(formatDbCycle)
    return json(cycles)
  } catch (error) {
    console.error('Get cycles error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
