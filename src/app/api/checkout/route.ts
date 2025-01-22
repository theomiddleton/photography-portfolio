import { db } from '~/server/db'
import { products, productSizes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { productId, sizeId } = await request.json()

    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1)

    const [size] = await db.select().from(productSizes).where(eq(productSizes.id, sizeId)).limit(1)

    if (!product || !size) {
      return Response.json({ error: 'Product or size not found' }, { status: 404 })
    }

    const headersList = headers()
    const host = headersList.get('host')
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: size.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${protocol}://${host}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${protocol}://${host}/store/${product.slug}`,
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return Response.json({ error: 'Checkout failed' }, { status: 500 })
  }
}

