'use server'

import { redirect } from 'next/navigation'
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

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: size.basePrice,
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        productId,
        sizeId,
      },
    })

    // Create a pending order
    await db.insert(orders).values({
      productId,
      sizeId,
      stripeSessionId: paymentIntent.id,
      status: 'pending',
      email: '', // Will be updated after payment
    })

    return { clientSecret: paymentIntent.client_secret }
  } catch (error) {
    console.error('Error:', error)
    throw new Error('Failed to create checkout session')
  }
}

export async function updateOrderStatus(
  sessionId: string,
  email: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
) {
  await db.update(orders).set({ email, status }).where(eq(orders.stripeSessionId, sessionId))
}

