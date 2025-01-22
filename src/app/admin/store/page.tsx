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
  return await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10)
}

export default async function AdminStorePage() {
  const [storeProducts, recentOrders] = await Promise.all([getProducts(), getRecentOrders()])

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold mb-8">Store Admin</h1>
          <AdminActions />
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <AdminOrders initialOrders={recentOrders} />
            <AdminProducts products={storeProducts} />
          </div>
        </div>
      </div>
    </main>
  )
}

