'use server'

import { dbWithTx as db } from '~/server/db'
import { orders, orderStatusHistory, users } from '~/server/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { isStoreEnabledServer } from '~/lib/store-utils'

export async function getOrders() {
  // Check if store is enabled
  if (!isStoreEnabledServer()) {
    throw new Error('Store is not available')
  }

  return await db.select().from(orders).orderBy(desc(orders.createdAt))
}

export async function updateOrder(
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  userId: number,
  note?: string,
) {
  // Check if store is enabled
  if (!isStoreEnabledServer()) {
    return { success: false, error: 'Store is not available' }
  }
  try {
    // First check if user exists
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user.length) {
      return { success: false, error: 'Invalid user ID' }
    }

    console.log('Updating order status...', orderId, status, userId, note)

    await db.transaction(async (tx) => {
      // Update the order status
      await tx
        .update(orders)
        .set({
          status,
          statusUpdatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(orders.id, orderId))

      // Add status history
      await tx.insert(orderStatusHistory).values({
        orderId,
        status,
        note,
        createdBy: userId,
      })
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to update order:', error)
    return { success: false, error: 'Failed to update order' }
  }
}

export async function getOrderStatusHistory(orderId: string) {
  try {
    if (!orderId) {
      console.error('Server: No orderId provided')
      return []
    }

    const history = await db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(desc(orderStatusHistory.createdAt))

    return Array.isArray(history) ? history : []
  } catch (error) {
    console.error('Server: Error fetching order history:', error)
    return []
  }
}
