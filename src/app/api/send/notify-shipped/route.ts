import { OrderShippedEmail, OrderShippedEmailText } from '~/components/emails/order-shipped'
import { Resend } from 'resend'
import { siteConfig } from '~/config/site'
import { db } from '~/server/db'
import { orders, products, productSizes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    // Fetch order details with product and size information
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(productSizes, eq(orders.sizeId, productSizes.id))
      .limit(1)

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    // Format the estimated delivery date (e.g., 5 business days from now)
    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)
    const formattedDelivery = estimatedDelivery.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // Send shipping notification email
    const email = await resend.emails.send({
      from: `${siteConfig.storeName} <${siteConfig.emails.order}>`,
      to: [order.orders.email],
      subject: `Your Order Has Shipped! - ${order.products.name}`,
      replyTo: `${siteConfig.storeName} <${siteConfig.emails.replyTo}>`,
      react: OrderShippedEmail({
        orderNumber: order.orders.orderNumber.toString(),
        customerName: order.orders.customerName,
        customerEmail: order.orders.email,
        productName: order.products.name,
        productSize: order.productSizes.name,
        imageUrl: order.products.imageUrl,
        trackingNumber: order.orders.trackingNumber || 'Not available',
        carrier: 'Royal Mail', // You might want to make this dynamic
        estimatedDelivery: formattedDelivery,
        shippingAddress: order.orders.shippingAddress
      }),
      text: OrderShippedEmailText({
        orderNumber: order.orders.orderNumber.toString(),
        customerName: order.orders.customerName,
        customerEmail: order.orders.email,
        productName: order.products.name,
        productSize: order.productSizes.name,
        imageUrl: order.products.imageUrl,
        trackingNumber: order.orders.trackingNumber || 'Not available',
        carrier: 'Royal Mail', // You might want to make this dynamic
        estimatedDelivery: formattedDelivery,
        shippingAddress: order.orders.shippingAddress
      })
    })

    if (email.error) {
      return Response.json({ error: email.error }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error sending shipping notification:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}