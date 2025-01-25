'use server'

import { dbWithTx as db } from '~/server/db'
import { orders, orderStatusHistory, users } from '~/server/db/schema'
import { desc, eq, sql } from 'drizzle-orm'

export async function getOrders() {
  return await db.select().from(orders).orderBy(desc(orders.createdAt))
}

export async function updateOrder(
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  userId: number,
  note?: string,
) {
  try {
    // First check if user exists
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user.length) {
      return { success: false, error: 'Invalid user ID' }
    }

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
  return await db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(desc(orderStatusHistory.createdAt))
}
