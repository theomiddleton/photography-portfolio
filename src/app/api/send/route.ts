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
    // Update order fetch to include shipping method
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.stripeSessionId, orderId))
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(productSizes, eq(orders.sizeId, productSizes.id))
      .leftJoin(
        shippingMethods,
        eq(orders.shippingMethodId, shippingMethods.id),
      )
      .limit(1)
      .then((results) => results[0])

    const orderDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Format monetary values
    const formattedSubtotal = `£${(order.orders.subtotal / 100).toFixed(2)}`
    const formattedShipping = `£${(order.orders.shippingCost / 100).toFixed(2)}`
    const formattedTax = `£${(order.orders.tax / 100).toFixed(2)}`
    const formattedTotal = `£${(order.orders.total / 100).toFixed(2)}`

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
          name: order.shippingMethods.name,
          description: order.shippingMethods.description || '',
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
          name: order.shippingMethods.name,
          description: order.shippingMethods.description || '',
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
      to: [process.env.ADMIN_EMAIL!],
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
      return Response.json(
        { error: customerEmail.error || adminEmail.error },
        { status: 500 },
      )
    }

    return Response.json({
      customerEmail: customerEmail.data,
      adminEmail: adminEmail.data,
    })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
