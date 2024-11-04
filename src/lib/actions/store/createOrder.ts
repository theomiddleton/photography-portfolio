'use server'

import { db } from '~/server/db'
import { storeOrders, storeOrderItems } from '~/server/db/schema'

export async function createOrder(formData: FormData) {
  if (formData === null || formData === undefined) {
    return { error: 'Invalid formData', status: 400 }
  }

  try {
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const postCode = formData.get('postalCode') as string
    const country = formData.get('country') as string
    const paymentMethod = formData.get('paymentMethod') as string
    const total = parseFloat(formData.get('total') as string)

    const orderData = {
      customerName: `${firstName} ${lastName}`,
      address,
      city,
      postCode,
      country,
      status: 'pending',
      paymentMethod,
      total,
    }

    const result = await db.insert(storeOrders).values(orderData)
    const orderId = result.insertId

    // Process cart items
    const items = []
    let i = 0
    while (formData.get(`items[${i}][id]`)) {
      items.push({
        orderId,
        imageId: parseInt(formData.get(`items[${i}][id]`) as string),
        quantity: parseInt(formData.get(`items[${i}][quantity]`) as string),
        frame: formData.get(`items[${i}][frame]`) as string,
      })
      i++
    }

    await db.insert(storeOrderItems).values(items)

    return { message: 'Order created successfully', orderId, status: 200 }
  } catch (error) {
    console.error('Error creating order:', error)
    return { error: 'Failed to create order', status: 500 }
  }
}