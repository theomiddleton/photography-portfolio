'use server'

import { stripe } from '~/lib/stripe'
import { db } from '~/server/db'
import { orders, products, productSizes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export async function createCheckoutSession(productId: string, sizeId: string) {
  try {
    // Get product and size details
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1)
    const sizes = await db.select().from(productSizes).where(eq(productSizes.id, sizeId)).limit(1)
    const size = sizes[0]

    if (!product || !size) {
      throw new Error('Product or size not found')
    }
    
    const subtotal = size.basePrice
    const shippingCost = 500
    const tax = Math.round(subtotal * 0.2)
    const total = subtotal + shippingCost + tax

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: {
        productId,
        sizeId,
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        tax: tax.toString(),
      },
    })

    // Create order record
    await db.insert(orders).values({
      stripeSessionId: paymentIntent.id,
      customerName: '',
      email: '',
      productId,
      sizeId,
      status: 'pending',
      subtotal,
      shippingCost,
      tax,
      total,
      currency: 'gbp',
    })

    return { clientSecret: paymentIntent.client_secret }
  } catch (error) {
    console.error('Error:', error)
    throw new Error('Failed to create checkout session')
  }
}

export async function updateOrderStatus(
  stripeSessionId: string,
  email: string,
  status: 'processing',
  shipping?: {
    name: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(stripeSessionId)
    
    if (paymentIntent.status !== 'succeeded') {
      return { success: false, error: 'Payment not completed' }
    }

    await db
      .update(orders)
      .set({
        status,
        email,
        customerName: shipping?.name,
        shippingAddress: shipping ? {
          name: shipping.name,
          line1: shipping.address.line1,
          line2: shipping.address.line2,
          city: shipping.address.city,
          state: shipping.address.state,
          postal_code: shipping.address.postal_code,
          country: shipping.address.country,
        } : undefined,
        statusUpdatedAt: new Date(),
      })
      .where(eq(orders.stripeSessionId, stripeSessionId))

    return { success: true }
  } catch (error) {
    console.error('Failed to update order:', error)
    return { success: false, error: 'Failed to update order' }
  }
}

