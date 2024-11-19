import { db } from '~/server/db'
import { logs } from '~/server/db/schema'

export async function logAction(scope: string, message: string) {
  try {
    await db.insert(logs).values({
      scope: scope,
      log: message,
    })
    return { success: true }
  } catch (error) {
    console.error('Error storing log:', error)
    return { success: false, error: 'Failed to store log' }
  }
}