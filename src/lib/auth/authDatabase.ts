'use server'

import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq, count } from 'drizzle-orm'

/**
 * Check if the system needs initial admin setup - SERVER ONLY
 * This function requires database access and should not be used in Edge Runtime
 */
export async function checkAdminSetupRequired(): Promise<boolean> {
  try {
    // Check if any admin users exist
    const adminCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'))
      .then((result) => result[0]?.count || 0)

    // If no admins exist, setup is required
    return adminCount === 0
  } catch (error) {
    console.error('Error checking admin setup requirement:', error)
    // On error, assume setup is not required for security
    return false
  }
}
