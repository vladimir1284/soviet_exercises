import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { queries } from '$db'

export const DELETE: RequestHandler = async ({ request, platform }) => {
  const db = (platform as any)?.env?.DB
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    const { userId, clerkId } = await request.json()

    if (!userId || !clerkId) {
      return json({ error: 'Missing userId or clerkId' }, { status: 400 })
    }

    // Double check that the clerkId matches the user
    const dbUser = await queries.getUserByClerkId(db, clerkId)
    if (!dbUser || dbUser.id !== userId) {
      return json({ error: 'Unauthorized deletion request' }, { status: 403 })
    }

    // Delete user (cascading will handle sets, exercises, etc.)
    await queries.deleteUser(db, userId)

    return json({ success: true })
  } catch (error) {
    console.error('Account deletion error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
