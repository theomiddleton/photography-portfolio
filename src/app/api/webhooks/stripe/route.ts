import { headers } from 'next/headers'
import { stripe } from '~/lib/stripe'
import { db } from '~/server/db'
import { orders } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { logAction } from '~/lib/logging'
import { webhookRateLimit, getClientIP } from '~/lib/rate-limit'

export async function POST(request: Request) {
  // Rate limiting
  const clientIP = getClientIP(request)
  const rateLimitResult = webhookRateLimit.check(clientIP)
  
  if (!rateLimitResult.success) {
    await logAction('webhook', `Rate limit exceeded for IP: ${clientIP}`)
    return new Response('Rate limit exceeded', { status: 429 })
  }

  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    await logAction('webhook', 'Missing Stripe signature')
    return new Response('Missing signature', { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    await logAction('webhook', 'Webhook secret not configured')
    return new Response('Server configuration error', { status: 500 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    await logAction('webhook', `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        
        await logAction('webhook', `Payment succeeded: ${paymentIntent.id}`)

        // Update order status to processing in a transaction
        const result = await db
          .update(orders)
          .set({
            status: 'processing',
            statusUpdatedAt: new Date(),
          })
          .where(eq(orders.stripeSessionId, paymentIntent.id))

        if (result.rowCount === 0) {
          await logAction('webhook', `Order not found for payment intent: ${paymentIntent.id}`)
        } else {
          await logAction('webhook', `Order status updated to processing for payment: ${paymentIntent.id}`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        
        await logAction('webhook', `Payment failed: ${paymentIntent.id}`)

        // Update order status to cancelled
        await db
          .update(orders)
          .set({
            status: 'cancelled',
            statusUpdatedAt: new Date(),
          })
          .where(eq(orders.stripeSessionId, paymentIntent.id))
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object
        
        await logAction('webhook', `Payment cancelled: ${paymentIntent.id}`)

        // Update order status to cancelled
        await db
          .update(orders)
          .set({
            status: 'cancelled',
            statusUpdatedAt: new Date(),
          })
          .where(eq(orders.stripeSessionId, paymentIntent.id))
        break
      }

      default:
        await logAction('webhook', `Unhandled event type: ${event.type}`)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    await logAction('webhook', `Webhook processing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return new Response('Internal server error', { status: 500 })
  }
}