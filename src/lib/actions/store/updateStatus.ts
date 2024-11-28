'use server'

import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { storeOrders } from '~/server/db/schema'

export async function updateStatus( id: number, status: string ) {
// export async function updateStatus({ id, status }: { id: number, status: string }) {
  if (status === null || status === undefined) {
    return { error: 'Invalid status', status: 400 }
  }

  try {
    const orderData = {
      status: status,
    }
    const result = await db.update(storeOrders).set(orderData).where(eq(storeOrders.id, id))

    console.log('Order Updated:', result)

    // return { message: 'Order created successfully', orderId: result.insertId, status: 200 }
  } catch (error) {
    console.error('Error creating order:', error)
    return { error: 'Failed to create order', status: 500 }
  }
}

export async function fetchStatus(id: number) {
  const result = await db.select({
    status: storeOrders.status,
  }).from(storeOrders)
  .where(eq(storeOrders.id, id))

  return result[0].status
}