import { db } from '~/server/db'
import { products, productSizes, orders } from '~/server/db/schema'
import { desc, eq } from 'drizzle-orm'
import { AdminOrders } from '~/components/store/admin/orders'
import { AdminProducts } from '~/components/store/admin/products'
import { AdminActions } from '~/components/store/admin/actions' 

async function getProducts() {
  return await db.select().from(products).orderBy(desc(products.createdAt))
}

async function getRecentOrders() {
  return await db.select({
    id: orders.id,
    orderNumber: orders.orderNumber,
    createdAt: orders.createdAt,
    updatedAt: orders.updatedAt,
    productId: orders.productId,
    sizeId: orders.sizeId,
    stripeSessionId: orders.stripeSessionId,
    status: orders.status,
    customerName: orders.customerName,
    email: orders.email,
    subtotal: orders.subtotal,
    shippingCost: orders.shippingCost,
    tax: orders.tax,
    total: orders.total,
    currency: orders.currency,
    shippingAddress: orders.shippingAddress,
    trackingNumber: orders.trackingNumber,
    statusUpdatedAt: orders.statusUpdatedAt,
    product: products,
    size: productSizes,
  }).from(orders)
    .leftJoin(products, eq(orders.productId, products.id))
    .leftJoin(productSizes, eq(orders.sizeId, productSizes.id))
    .orderBy(desc(orders.createdAt))
    // .limit(10)
}

export default async function AdminStorePage() {
  const [storeProducts, recentOrders] = await Promise.all([getProducts(), getRecentOrders()])


  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold mb-8">Store Admin</h1>
          <AdminActions />
          <div className="flex flex-col gap-8 mt-8">
            <AdminOrders initialOrders={recentOrders}/>
            <AdminProducts products={storeProducts} />
          </div>
        </div>
      </div>
    </main>
  )
}

