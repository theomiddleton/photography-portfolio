'use server'

import { stripe } from '~/lib/stripe'
import { db, dbWithTx } from '~/server/db'
import {
  orders,
  products,
  productSizes,
  storeCosts,
  shippingMethods,
  basePrintSizes,
} from '~/server/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createCheckoutSession(
  productId: string,
  sizeId: string,
  shippingMethodId: string,
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

    // Get product, size, base size, and shipping method details
    const [product, size, baseSize, shippingMethod] = await Promise.all([
      db.select().from(products).where(eq(products.id, productId)).limit(1),
      db
        .select()
        .from(productSizes)
        .where(eq(productSizes.id, sizeId))
        .limit(1),
      db
        .select()
        .from(basePrintSizes)
        .where(
          and(
            eq(basePrintSizes.width, size[0]?.width),
            eq(basePrintSizes.height, size[0]?.height),
            eq(basePrintSizes.active, true),
          ),
        )
        .limit(1),
      db
        .select()
        .from(shippingMethods)
        .where(eq(shippingMethods.id, shippingMethodId))
        .limit(1),
    ])

    if (!product[0] || !size[0] || !baseSize[0] || !shippingMethod[0]) {
      throw new Error('Product, size, base size, or shipping method not found')
    }

    // Calculate the subtotal based on the pricing rules
    let subtotal = baseSize[0].basePrice
    if (baseSize[0].sellAtPrice) {
      // If a fixed sell-at price is set, use that
      subtotal = baseSize[0].sellAtPrice
    } else if (baseSize[0].profitPercentage) {
      // Otherwise, calculate price using profit percentage
      const profitMultiplier = 1 + baseSize[0].profitPercentage / 1000000
      subtotal = Math.round(baseSize[0].basePrice * profitMultiplier)
    }

    const shippingCost = shippingMethod[0].price

    const costs = await db
      .select()
      .from(storeCosts)
      .where(eq(storeCosts.active, true))
      .orderBy(desc(storeCosts.createdAt))
      .limit(1)

    const baseAmount = subtotal + shippingCost // in pence

    // Convert stored tax rates to decimals.
    // Using defaults of 0.20 for taxRate and 0.015 for stripeTaxRate if not provided.
    const taxRateDecimal =
      costs[0]?.taxRate !== undefined ? costs[0].taxRate / 1000000 : 0.2
    const stripeTaxRateDecimal =
      costs[0]?.stripeTaxRate !== undefined
        ? costs[0].stripeTaxRate / 1000000
        : 0.015

    // Calculate the tax amounts (in pence)
    const tax = Math.round(baseAmount * taxRateDecimal)
    const stripeTax = Math.round(baseAmount * stripeTaxRateDecimal)

    // Calculate overall total (in pence)
    const total = baseAmount + tax + stripeTax

    console.log('Stripe Tax Calculation')
    console.log(
      'Subtotal + Shipping Cost:',
      baseAmount,
      'pence (£',
      (baseAmount / 100).toFixed(2),
      ')',
    )
    console.log('Tax Rate (decimal):', taxRateDecimal)
    console.log('Stripe Tax Rate (decimal):', stripeTaxRateDecimal)
    console.log('Calculated Tax:', tax, 'pence (', (tax / 100).toFixed(2), '£)')
    console.log(
      'Calculated Stripe Tax:',
      stripeTax,
      'pence (£',
      (stripeTax / 100).toFixed(2),
      ')',
    )
    console.log('Total:', total, 'pence (£', (total / 100).toFixed(2), ')')

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
    await dbWithTx.transaction(async (tx) => {
      await tx
        .update(storeCosts)
        .set({ active: false })
        .where(eq(storeCosts.active, true))

      // Convert percentage to integer (multiply by 10000 to preserve 4 decimal places)
      const taxRateInt = Math.round(taxRate * 10000)
      const stripeRateInt = Math.round(stripeRate * 10000)

      // Create new record
      await tx.insert(storeCosts).values({
        taxRate: taxRateInt,
        stripeTaxRate: stripeRateInt,
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

export async function getTaxRates() {
  try {
    const costs = await db
      .select()
      .from(storeCosts)
      .where(eq(storeCosts.active, true))
      .orderBy(desc(storeCosts.createdAt))
      .limit(1)

    if (!costs.length) {
      return {
        taxRate: 2000,
        stripeTaxRate: 150,
      }
    }

    return {
      taxRate: costs[0].taxRate,
      stripeTaxRate: costs[0].stripeTaxRate,
    }
  } catch (error) {
    console.error('Error fetching tax rates:', error)
    return null
  }
}
