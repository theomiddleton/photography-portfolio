import { redirect } from 'next/navigation'
import { db } from '~/server/db'
import { orders, products, productSizes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { CheckCircle } from 'lucide-react'
import { formatPrice } from '~/lib/utils'
import { siteConfig } from '~/config/site'
import Link from 'next/link' 

export default async function SuccessPage(
  props: {
    searchParams: Promise<{ session_id: string }>
  }
) {
  const searchParams = await props.searchParams;
  const sessionId = searchParams.session_id

  if (!sessionId) {
    redirect('/')
  }

  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .leftJoin(products, eq(orders.productId, products.id))
    .leftJoin(productSizes, eq(orders.sizeId, productSizes.id))
    .limit(1)
    .then((results) => results[0])

  if (!order) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-white text-black py-24">
      <div className="container max-w-lg">
        <div className="rounded-lg border bg-card p-8 text-card-foreground shadow">
          <div className="flex flex-col items-center space-y-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h1 className="text-2xl font-semibold">Thank you for your order!</h1>
            <p className="text-muted-foreground">
              Your order has been confirmed. We&apos;ll send you a confirmation email with your order details.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Order number</span>
                <span className="font-mono">{order.orders.id.split('-')[0]}</span>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 space-y-4">
              <h2 className="font-semibold">Order details</h2>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{order.products.name}</p>
                  <p className="text-sm text-muted-foreground">Size: {order.productSizes.name}</p>
                </div>
                <p className="font-medium">{formatPrice(order.productSizes.basePrice)}</p>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
              <h2 className="font-semibold">Price Breakdown</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.orders.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(order.orders.shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(order.orders.tax)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(order.orders.total)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 space-y-4">
              <h2 className="font-semibold">Customer Details</h2>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Name: {order.orders.customerName}</p>
                  <p className="text-sm text-muted-foreground">Email: {order.orders.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 space-y-4">
              <h2 className="font-semibold">Shipping address</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                {order.orders.shippingAddress && (
                  <>
                    <p>{order.orders.shippingAddress.name}</p>
                    <p>{order.orders.shippingAddress.line1}</p>
                    {order.orders.shippingAddress.line2 && (
                      <p>{order.orders.shippingAddress.line2}</p>
                    )}
                    <p>
                      {order.orders.shippingAddress.city}, {order.orders.shippingAddress.state}{' '}
                      {order.orders.shippingAddress.postal_code}
                    </p>
                    <p>{order.orders.shippingAddress.country}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{' '}
              <Link href={`mailto:${siteConfig.emails.support}`} className="text-primary hover:underline hover:text-blue-600">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

