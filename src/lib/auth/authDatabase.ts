'use server'

import { db, dbWithTx } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq, count, sql } from 'drizzle-orm'

/**
 * Check if the system needs initial admin setup - SERVER ONLY
 * This function requires database access and should not be used in Edge Runtime
 * NOTE: This function is not race-condition safe. Use checkAdminSetupRequiredSafe for atomic operations.
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

/**
 * Transaction-safe version to check if admin setup is required
 * Uses advisory locks to prevent race conditions during concurrent checks
 */
export async function checkAdminSetupRequiredSafe(): Promise<boolean> {
  try {
    return await dbWithTx.transaction(async (tx) => {
      // Set SERIALIZABLE isolation level
      await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`)

      // Acquire advisory lock for admin setup checks
      await tx.execute(sql`SELECT pg_advisory_xact_lock(0x41444D494E)`) // 'ADMIN' as hex

      // Check if any admin users exist
      const adminCount = await tx
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, 'admin'))
        .then((result) => result[0]?.count || 0)

      // If no admins exist, setup is required
      return adminCount === 0
    })
  } catch (error) {
    console.error('Error checking admin setup requirement (safe):', error)
    // On error, assume setup is not required for security
    return false
  }
}
