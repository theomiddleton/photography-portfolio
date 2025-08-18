import { notFound } from 'next/navigation'
import { db } from '~/server/db'
import { products, productSizes, orders, shippingMethods } from '~/server/db/schema'
import { desc, eq } from 'drizzle-orm'
import { AdminOrders } from '~/components/store/admin/orders'
import { AdminProducts } from '~/components/store/admin/products'
import { AdminActions } from '~/components/store/admin/actions' 
import { StoreAnalytics } from '~/components/store/admin/store-analytics'
import { getSession } from '~/lib/auth/auth'
import { isStoreEnabledServer } from '~/lib/store-utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Store Management - Admin',
  description: 'Manage products, orders, and store settings'
}

export const revalidate = 30 

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
    shippingMethodId: orders.shippingMethodId,
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
    shippingMethod: shippingMethods,
  }).from(orders)
    .leftJoin(products, eq(orders.productId, products.id))
    .leftJoin(productSizes, eq(orders.sizeId, productSizes.id))
    .leftJoin(shippingMethods, eq(orders.shippingMethodId, shippingMethods.id))
    .orderBy(desc(orders.createdAt))
}

async function getAllOrders() {
  return await db.select().from(orders).orderBy(desc(orders.createdAt))
}

export default async function AdminStorePage() {
  // Return 404 if store is disabled
  if (!isStoreEnabledServer()) {
    notFound()
  }

  const [storeProducts, recentOrders, allOrders] = await Promise.all([
    getProducts(), 
    getRecentOrders(),
    getAllOrders()
  ])
  const session = await getSession()

  if (!session?.id) {
    throw new Error('Unauthorized: Session ID is required')
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Store Management</h1>
          <p className="text-gray-600 mb-8">Manage your store products, orders, and analytics</p>
          
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <StoreAnalytics orders={allOrders} products={storeProducts} />
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <AdminOrders initialOrders={recentOrders} userId={session.id} />
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <AdminProducts products={storeProducts} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <AdminActions />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

