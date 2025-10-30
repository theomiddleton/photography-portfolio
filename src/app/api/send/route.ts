import {
  OrderConfirmationEmail,
  OrderConfirmationEmailText,
} from '~/components/emails/order-confirmation'
import {
  AdminOrderNotificationEmail,
  AdminOrderNotificationText,
} from '~/components/emails/admin-order-notification'
import { Resend } from 'resend'
import { db } from '~/server/db'
import {
  orders,
  products,
  productSizes,
  shippingMethods,
} from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { siteConfig } from '~/config/site'
import { emailSchema } from '~/lib/validations/store'
import { logAction } from '~/lib/logging'
import { emailRateLimit, getClientIP } from '~/lib/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

interface _ShippingDetails {
  name: string
  address: ShippingAddress
}

export async function POST(request: Request) {
  // Rate limiting
  const clientIP = getClientIP(request)
  const rateLimitResult = await emailRateLimit.check(clientIP)
  
  if (!rateLimitResult.success) {
    await logAction('email', `Rate limit exceeded for IP: ${clientIP}`)
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const requestData = await request.json()

    // Validate input data
    const validatedInput = emailSchema.safeParse(requestData)

    if (!validatedInput.success) {
      await logAction('email', `Invalid email request: ${validatedInput.error.message}`)
      return Response.json({ error: 'Invalid input parameters' }, { status: 400 })
    }

    const { email, orderId, shippingDetails } = validatedInput.data

    await logAction('email', `Processing email request for order: ${orderId}`)

    // Fetch order details with security check
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.stripeSessionId, orderId))
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(productSizes, eq(orders.sizeId, productSizes.id))
      .leftJoin(shippingMethods, eq(orders.shippingMethodId, shippingMethods.id))
      .limit(1)
      .then((results) => results[0])

    if (!order) {
      await logAction('email', `Order not found for ID: ${orderId}`)
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    // Security check: ensure order is in processing status
    if (order.orders.status !== 'processing') {
      await logAction('email', `Email attempt for non-processing order: ${orderId}, status: ${order.orders.status}`)
      return Response.json({ error: 'Order not in valid status for email' }, { status: 400 })
    }

    const orderDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Format monetary values safely
    const formattedSubtotal = `£${(order.orders.subtotal / 100).toFixed(2)}`
    const formattedShipping = `£${(order.orders.shippingCost / 100).toFixed(2)}`
    const formattedTax = `£${(order.orders.tax / 100).toFixed(2)}`
    const formattedTotal = `£${(order.orders.total / 100).toFixed(2)}`

    // Validate admin email exists
    if (!process.env.ADMIN_EMAIL) {
      await logAction('email', 'Admin email not configured')
      return Response.json({ error: 'Email configuration error' }, { status: 500 })
    }

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
        subtotal: formattedSubtotal,
        shippingCost: formattedShipping,
        tax: formattedTax,
        total: formattedTotal,
        imageUrl: order.products.imageUrl,
        shippingMethod: {
          name: order.shippingMethods?.name || 'Standard Shipping',
          description: order.shippingMethods?.description || '',
        },
        shippingAddress: {
          line1: shippingDetails?.address.line1 || '',
          line2: shippingDetails?.address.line2,
          city: shippingDetails?.address.city || '',
          state: shippingDetails?.address.state,
          postal_code: shippingDetails?.address.postal_code || '',
          country: shippingDetails?.address.country || '',
        },
      }),
      text: OrderConfirmationEmailText({
        orderNumber: order.orders.orderNumber.toString(),
        customerName: order.orders.customerName,
        customerEmail: order.orders.email,
        productName: order.products.name,
        productSize: order.productSizes.name,
        subtotal: formattedSubtotal,
        shippingCost: formattedShipping,
        tax: formattedTax,
        total: formattedTotal,
        imageUrl: order.products.imageUrl,
        shippingMethod: {
          name: order.shippingMethods?.name || 'Standard Shipping',
          description: order.shippingMethods?.description || '',
        },
        shippingAddress: {
          line1: shippingDetails?.address.line1 || '',
          line2: shippingDetails?.address.line2,
          city: shippingDetails?.address.city || '',
          state: shippingDetails?.address.state,
          postal_code: shippingDetails?.address.postal_code || '',
          country: shippingDetails?.address.country || '',
        },
      }),
    })

    // Send admin notification email
    const adminEmail = await resend.emails.send({
      from: `${siteConfig.storeName} <${siteConfig.emails.order}>`,
      to: [process.env.ADMIN_EMAIL],
      subject: `New Order #${order.orders.orderNumber} - ${order.products.name}`,
      replyTo: `${siteConfig.storeName} <${siteConfig.emails.replyTo}>`,
      react: AdminOrderNotificationEmail({
        orderNumber: order.orders.orderNumber.toString(),
        customerName: order.orders.customerName,
        customerEmail: order.orders.email,
        productName: order.products.name,
        productSize: order.productSizes.name,
        price: formattedTotal,
        orderDate,
        shippingAddress: {
          line1: shippingDetails?.address.line1 || '',
          line2: shippingDetails?.address.line2,
          city: shippingDetails?.address.city || '',
          state: shippingDetails?.address.state,
          postal_code: shippingDetails?.address.postal_code || '',
          country: shippingDetails?.address.country || '',
        },
        adminDashboardUrl: `${siteConfig.url}/admin/orders/`,
      }),
      text: AdminOrderNotificationText({
        orderNumber: order.orders.orderNumber.toString(),
        customerName: order.orders.customerName,
        customerEmail: order.orders.email,
        productName: order.products.name,
        productSize: order.productSizes.name,
        price: formattedTotal,
        orderDate,
        shippingAddress: {
          line1: shippingDetails?.address.line1 || '',
          line2: shippingDetails?.address.line2,
          city: shippingDetails?.address.city || '',
          state: shippingDetails?.address.state,
          postal_code: shippingDetails?.address.postal_code || '',
          country: shippingDetails?.address.country || '',
        },
      }),
    })

    if (customerEmail.error || adminEmail.error) {
      await logAction('email', `Email sending failed: ${customerEmail.error || adminEmail.error}`)
      return Response.json(
        { error: 'Failed to send emails' },
        { status: 500 },
      )
    }

    await logAction('email', `Emails sent successfully for order: ${orderId}`)

    return Response.json({
      customerEmail: customerEmail.data,
      adminEmail: adminEmail.data,
    })
  } catch (error) {
    await logAction('email', `Email processing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
