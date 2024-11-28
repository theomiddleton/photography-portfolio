'use server'

import { db } from '~/server/db'
import { storeOrders } from '~/server/db/schema'

export async function createOrder(formData: FormData) {
  if (formData === null || formData === undefined) {
    return { error: 'Invalid formData', status: 400 }
  }

  try {
    const imageId = formData.get('imageId') as string
    const storeImageId = parseInt(formData.get('storeImageId') as string, 10)
    const itemId = formData.get('itemId') as string
    const quantity = parseInt(formData.get('quantity') as string, 10)
    const total = parseFloat(formData.get('total') as string)
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const postCode = formData.get('postalCode') as string
    const country = formData.get('country') as string
    const paymentMethod = formData.get('paymentMethod') as string

    const orderData = {
      customerName: `${firstName} ${lastName}`,
      imageId: Number(imageId),
      storeImageId,
      itemId,
      address,
      city,
      postCode,
      country,
      status: 'pending',
      paymentMethod,
      quantity,
      total,
      // orderDate: new Date(),
    }

    const result = await db.insert(storeOrders).values(orderData)

    console.log('Order created:', result)

    // return { message: 'Order created successfully', orderId: result.insertId, status: 200 }
  } catch (error) {
    console.error('Error creating order:', error)
    return { error: 'Failed to create order', status: 500 }
  }
}