import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { queries, formatDbMetric } from '$db'

// Get all metrics for an exercise
export const GET: RequestHandler = async ({ params, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const exerciseId = params.id
  if (!exerciseId) {
    return json({ error: 'Exercise ID required' }, { status: 400 })
  }

  try {
    const result = await queries.getMetricsByExercise(db, parseInt(exerciseId))
    const metrics = (result.results || []).map(formatDbMetric)
    return json(metrics)
  } catch (error) {
    console.error('Get metrics error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new metric for an exercise
export const POST: RequestHandler = async ({ params, request, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const exerciseId = params.id
  if (!exerciseId) {
    return json({ error: 'Exercise ID required' }, { status: 400 })
  }

  try {
    const { label, unit } = await request.json()

    if (!label) {
      return json({ error: 'Label required' }, { status: 400 })
    }

    const metric = await queries.createMetric(db, parseInt(exerciseId), label, unit)

    if (!metric) {
      return json({ error: 'Failed to create metric' }, { status: 500 })
    }

    return json(formatDbMetric(metric))
  } catch (error) {
    console.error('Create metric error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete a metric
export const DELETE: RequestHandler = async ({ url, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const metricId = url.searchParams.get('metricId')
  if (!metricId) {
    return json({ error: 'Metric ID required' }, { status: 400 })
  }

  try {
    await queries.deleteMetric(db, parseInt(metricId))
    return json({ success: true })
  } catch (error) {
    console.error('Delete metric error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
