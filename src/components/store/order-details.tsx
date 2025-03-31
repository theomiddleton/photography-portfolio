import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { notFound } from 'next/navigation'

import { db } from '~/server/db'
import { storeImages, imageData, storeOrders } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { OrderStatusChanger } from '~/components/store/order-status-changer'

interface OrderDetailsProps {
  orderId: string
}

export async function OrderDetails({ orderId }: OrderDetailsProps) {
  if (!orderId || isNaN(parseInt(orderId, 10))) {
    notFound()
  }

  const id = parseInt(orderId, 10)

  const result = await db.select({
    id: storeOrders.id,
    fileUrl: imageData.fileUrl,
    name: imageData.name,
    customerName: storeOrders.customerName,
    address: storeOrders.address,
    postCode: storeOrders.postCode,
    city: storeOrders.city,
    country: storeOrders.country,
    price: storeImages.price,
    total: storeOrders.total,
    quantity: storeOrders.quantity,
    status: storeOrders.status,
    createdAt: storeOrders.createdAt
  }).from(storeOrders)
  .where(eq(storeOrders.id, id))
  .innerJoin(imageData, eq(storeOrders.storeImageId, imageData.id))
  .innerJoin(storeImages, eq(storeOrders.storeImageId, storeImages.id))

  if (!result || result.length === 0) {
    notFound()
  }

  const shipping = 5.00
  const order = result[0]

  const countryNames = {
    us: 'United States',
    uk: 'United Kingdom',
    ca: 'Canada',
  }

  const country = countryNames[order.country] || order.country

  return (
    <Card>
      <CardHeader className="bg-muted/50">
        <CardTitle>Order Details</CardTitle>
        <CardDescription>
          View and edit order details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <span className="font-semibold">Order {order.id}</span>
          </div>

          <div className="font-semibold">Order Details</div>
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {order.name} x <span>{order.quantity}</span>
              </span>
              <span>£{order.price}</span>
            </li>
          </ul>

          <Separator />
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>£{order.price * order.quantity}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>£{shipping}</span>
            </li>
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted-foreground">Total</span>
              <span>£{order.total}</span>
            </li>
          </ul>

          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <div className="font-semibold">Shipping Information</div>
              <address className="grid gap-0.5 not-italic text-muted-foreground">
                <span>{order.customerName}</span>
                <span>{order.address}</span>
                <span>{order.city}</span>
                <span>{order.postCode}</span>
                <span>{country}</span>
              </address>
            </div>
          </div>
          <Separator />

          <div className="grid gap-3">
            <div className="flex gap-4">
              {/* order status
              <OrderStatus orderId={order.id.toString()} />  */}
              {/* order status changer */}
              <OrderStatusChanger id={order.id} initialStatus={order.status} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}