'use server'

import { dbWithTx as db } from '~/server/db'
import { shippingMethods, orders } from '~/server/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

interface ShippingMethodInput {
  id?: string
  name: string
  description: string
  price: number
  estimatedDays: number | null
}

export async function getShippingMethods() {
  return await db
    .select()
    .from(shippingMethods)
    .where(eq(shippingMethods.active, true))
}

export async function updateShippingMethods(methods: ShippingMethodInput[]) {
  try {
    await db.transaction(async (tx) => {
      // Deactivate all current methods
      await tx
        .update(shippingMethods)
        .set({ active: false })
        .where(eq(shippingMethods.active, true))

      // Insert new methods
      for (const method of methods) {
        await tx.insert(shippingMethods).values({
          name: method.name,
          description: method.description,
          price: method.price,
          estimatedDays: method.estimatedDays,
          active: true,
        })
      }
    })

    revalidatePath('/admin/store/costs')
    return { success: true }
  } catch (error) {
    console.error('Error updating shipping methods:', error)
    return { success: false, error: 'Failed to update shipping methods' }
  }
}

export async function updateOrderShipping(orderId: string, shippingMethodId: string) {
  try {
    // First get the shipping method to get the price
    const [method] = await db
      .select()
      .from(shippingMethods)
      .where(eq(shippingMethods.id, shippingMethodId))
      .limit(1)

    if (!method) {
      return { success: false, error: 'Shipping method not found' }
    }

    // Update the order with new shipping method and recalculate total
    await db
      .update(orders)
      .set({
        shippingMethodId,
        shippingCost: method.price,
        total: sql`subtotal + ${method.price} + tax`,
        updatedAt: new Date(),
      })
      .where(eq(orders.stripeSessionId, orderId))

    return { success: true }
  } catch (error) {
    console.error('Error updating order shipping:', error)
    return { success: false, error: 'Failed to update order shipping' }
  }
}
