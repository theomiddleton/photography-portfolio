'use server'

import { stripe } from '~/lib/stripe'
import { db } from '~/server/db'
import { orders, products, productSizes, storeCosts, shippingMethods } from '~/server/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createCheckoutSession(
  productId: string, 
  sizeId: string,
  shippingMethodId: string
) {
  try {
    // Check if there's already a pending order for this product and size
    const existingOrder = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.productId, productId),
          eq(orders.sizeId, sizeId),
          eq(orders.status, 'pending'),
        ),
      )
      .limit(1)

    // If there's an existing pending order, return its client secret
    if (existingOrder[0]) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        existingOrder[0].stripeSessionId,
      )
      return { clientSecret: paymentIntent.client_secret }
    }

    // Get product and size details
    const [product, size, shippingMethod] = await Promise.all([
      db.select().from(products).where(eq(products.id, productId)).limit(1),
      db.select().from(productSizes).where(eq(productSizes.id, sizeId)).limit(1),
      db.select().from(shippingMethods).where(eq(shippingMethods.id, shippingMethodId)).limit(1)
    ])

    if (!product[0] || !size[0] || !shippingMethod[0]) {
      throw new Error('Product, size, or shipping method not found')
    }

    const subtotal = size[0].basePrice
    const shippingCost = shippingMethod[0].price
    
    const costs = await db
      .select()
      .from(storeCosts)
      .where(eq(storeCosts.active, true))
      .orderBy(desc(storeCosts.createdAt))
      .limit(1)

    const tax = Math.round(
      (subtotal + shippingCost) *
        (costs[0]?.taxRate ? costs[0].taxRate / 100 : 20),
    )
    const stripeTax = Math.round(
      (subtotal + shippingCost) *
      (costs[0]?.stripeTaxRate ? costs[0].stripeTaxRate / 100 : 1.5),
    )
    const total = subtotal + shippingCost + tax + stripeTax

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: {
        productId,
        sizeId,
        shippingMethodId,
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        tax: tax.toString(),
      },
    })

    // Create order record
    const [order] = await db
      .insert(orders)
      .values({
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
      .returning()

    return {
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    }
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
  },
) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(stripeSessionId)

    if (paymentIntent.status !== 'succeeded') {
      return { success: false, error: 'Payment not completed' }
    }

    // Update existing order instead of creating a new one
    const result = await db
      .update(orders)
      .set({
        status,
        email,
        customerName: shipping?.name,
        shippingAddress: shipping
          ? {
              name: shipping.name,
              line1: shipping.address.line1,
              line2: shipping.address.line2,
              city: shipping.address.city,
              state: shipping.address.state,
              postal_code: shipping.address.postal_code,
              country: shipping.address.country,
            }
          : undefined,
        statusUpdatedAt: new Date(),
      })
      .where(eq(orders.stripeSessionId, stripeSessionId))

    return { success: true }
  } catch (error) {
    console.error('Failed to update order:', error)
    return { success: false, error: 'Failed to update order' }
  }
}

export async function updateTaxRates(taxRate: number, stripeRate: number) {
  try {
    // Get current costs first
    const currentCosts = await db
      .select()
      .from(storeCosts)
      .orderBy(desc(storeCosts.createdAt))
      .limit(1)

    await db.transaction(async (tx) => {
      // Deactivate current active record
      await tx
        .update(storeCosts)
        .set({ active: false })
        .where(eq(storeCosts.active, true))

      // Create new record
      await tx.insert(storeCosts).values({
        taxRate: Math.round(taxRate),
        stripeTaxRate: Math.round(stripeRate),
        active: true,
      })
    })
    revalidatePath('/admin/store/costs')
    return { success: true }
  } catch (error) {
    console.error('Error updating tax rates:', error)
    return { success: false, error: 'Failed to update tax rates' }
  }
}