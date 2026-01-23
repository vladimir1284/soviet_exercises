import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { queries, formatDbMetricValue } from '$db'

// Get metric values for a cycle
export const GET: RequestHandler = async ({ params, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const cycleId = params.id
  if (!cycleId) {
    return json({ error: 'Cycle ID required' }, { status: 400 })
  }

  try {
    const result = await queries.getMetricValuesByCycle(db, parseInt(cycleId))
    const values = (result.results || []).map(formatDbMetricValue)
    return json(values)
  } catch (error) {
    console.error('Get cycle metrics error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Upsert metric values for a cycle
export const POST: RequestHandler = async ({ params, request, platform }) => {
  const db = platform?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  const cycleId = params.id
  if (!cycleId) {
    return json({ error: 'Cycle ID required' }, { status: 400 })
  }

  try {
    const { metricValues } = await request.json()

    if (!metricValues || !Array.isArray(metricValues)) {
      return json({ error: 'Metric values array required' }, { status: 400 })
    }

    const results = []
    for (const mv of metricValues) {
      if (mv.metricId && mv.value !== undefined) {
        const updated = await queries.upsertMetricValue(db, parseInt(cycleId), mv.metricId, String(mv.value))
        if (updated) {
          results.push(formatDbMetricValue(updated))
        }
      }
    }

    return json(results)
  } catch (error) {
    console.error('Upsert cycle metrics error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
