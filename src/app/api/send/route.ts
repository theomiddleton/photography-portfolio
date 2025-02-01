import { OrderConfirmationEmail, OrderConfirmationEmailText } from '~/components/emails/order-confirmation'
import { AdminOrderNotificationEmail, AdminOrderNotificationText } from '~/components/emails/admin-order-notification'
import { Resend } from 'resend'
import { db } from '~/server/db'
import { orders, products, productSizes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { siteConfig } from '~/config/site'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
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
      shippingDetails,
    }: {
      email: string
      orderId: string
      shippingDetails?: ShippingDetails
    } = await request.json()

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
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
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    // Format price from pennies to pounds with £ symbol
    const formattedPrice = `£${(order.orders.total / 100).toFixed(2)}`

    // Format the current date
    const orderDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Send customer confirmation email
    const customerEmail = await resend.emails.send({
      from: `${siteConfig.storeName} <${siteConfig.emails.order}>`,
      to: [email],
      subject: `Order Confirmation #${order.products.name}`,
      replyTo: `${siteConfig.storeName} <${siteConfig.emails.replyTo}>`,
      react: OrderConfirmationEmail({
        orderNumber: order.orders.orderNumber.toString(),
        customerName: order.orders.customerName,
        customerEmail: order.orders.email,
        productName: order.products.name,
        productSize: order.productSizes.name,
        price: formattedPrice,
        imageUrl: order.products.imageUrl,
        shippingAddress: {
          line1: shippingDetails?.address.line1 || '',
          line2: shippingDetails?.address.line2,
          city: shippingDetails?.address.city || '',
          state: shippingDetails?.address.state,
          postalCode: shippingDetails?.address.postalCode || '',
          country: shippingDetails?.address.country || '',
        },
      }),
      text: OrderConfirmationEmailText({
        orderNumber: order.orders.orderNumber.toString(),
        customerName: order.orders.customerName,
        customerEmail: order.orders.email,
        productName: order.products.name,
        productSize: order.productSizes.name,
        price: formattedPrice,
        imageUrl: order.products.imageUrl,
        shippingAddress: {
          line1: shippingDetails?.address.line1 || '',
          line2: shippingDetails?.address.line2,
          city: shippingDetails?.address.city || '',
          state: shippingDetails?.address.state,
          postalCode: shippingDetails?.address.postalCode || '',
          country: shippingDetails?.address.country || '',
        },
      }),
    })
    
    // Send admin notification email
    const adminEmail = await resend.emails.send({
      from: `${siteConfig.storeName} <${siteConfig.emails.order}>`,
      to: [process.env.ADMIN_EMAIL!],
      subject: `New Order #${order.orders.orderNumber} - ${order.products.name}`,
      replyTo: `${siteConfig.storeName} <${siteConfig.emails.replyTo}>`,
      react: AdminOrderNotificationEmail({
        orderNumber: order.orders.orderNumber.toString(),
        customerName: order.orders.customerName,
        customerEmail: order.orders.email,
        productName: order.products.name,
        productSize: order.productSizes.name,
        price: formattedPrice,
        orderDate,
        shippingAddress: {
          line1: shippingDetails?.address.line1 || '',
          line2: shippingDetails?.address.line2,
          city: shippingDetails?.address.city || '',
          state: shippingDetails?.address.state,
          postalCode: shippingDetails?.address.postalCode || '',
          country: shippingDetails?.address.country || '',
        },
        adminDashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order.orders.orderNumber}`,
      }),
      text: AdminOrderNotificationText({
        orderNumber: order.orders.orderNumber.toString(),
        customerName: order.orders.customerName,
        customerEmail: order.orders.email,
        productName: order.products.name,
        productSize: order.productSizes.name,
        price: formattedPrice,
        orderDate,
        shippingAddress: {
          line1: shippingDetails?.address.line1 || '',
          line2: shippingDetails?.address.line2,
          city: shippingDetails?.address.city || '',
          state: shippingDetails?.address.state,
          postalCode: shippingDetails?.address.postalCode || '',
          country: shippingDetails?.address.country || '',
        },
      }),
    })

    if (customerEmail.error || adminEmail.error) {
      return Response.json({ error: customerEmail.error || adminEmail.error }, { status: 500 })
    }

    return Response.json({ customerEmail: customerEmail.data, adminEmail: adminEmail.data })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
