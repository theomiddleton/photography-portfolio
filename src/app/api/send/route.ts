import { OrderConfirmationEmail } from '~/components/emails/order-confirmation'
import { Resend } from 'resend'
import { db } from '~/server/db'
import { orders, products, productSizes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

interface ShippingDetails {
  name: string
  address: ShippingAddress
}

export async function POST(request: Request) {
  try {
    const { 
      email, 
      orderId, 
      shippingDetails 
    }: { 
      email: string
      orderId: string
      shippingDetails?: ShippingDetails 
    } = await request.json()

    if (!email) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Fetch order details
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.stripeSessionId, orderId))
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(productSizes, eq(orders.sizeId, productSizes.id))
      .limit(1)
      .then((results) => results[0])

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'Order receipt <orders@email.theoo.ooo>',
      to: [email],
      subject: `Order Confirmation #${orderId}`,
      react: OrderConfirmationEmail({ 
        firstName: shippingDetails?.name || email.split('@')[0],
        orderId,
        shippingAddress: shippingDetails?.address,
        orderDetails: {
          productName: order.products.name,
          size: order.productSizes.name,
          price: order.productSizes.basePrice,
          customerName: order.orders.customerName,
          customerEmail: order.orders.email
        }
      }),
    })

    if (error) {
      return Response.json({ error }, { status: 500 })
    }

    return Response.json(data)
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
