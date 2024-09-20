import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { storeImages, imageData, storeOrders } from '~/server/db/schema'

import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { ChevronLeft } from 'lucide-react'

import { OrderDetails } from '~/components/store/order-details'

export const revalidate = 60
export const dynamicParams = true

// similar to store/[id].tsx, this page is the admin view of orders, with more details and actions available in the OrderDetails component
// it fetchest all necessary data from the database, joining multiple tables, and renders the OrderDetails component,

export default async function Product({ params }: { params: { id: string } }) {
  const orderId = parseInt(params.id, 10)

  const result = await db.select({
    id: storeOrders.id,
    fileUrl: imageData.fileUrl,
    name: imageData.name,
    description: imageData.description,
    price: storeImages.price,
    total: storeOrders.total,
    quantity: storeOrders.quantity,
    status: storeOrders.status,
    createdAt: storeOrders.createdAt
  }).from(storeOrders)
  .where(eq(storeOrders.id, orderId))
  .innerJoin(imageData, eq(storeOrders.storeImageId, imageData.id))
  .innerJoin(storeImages, eq(storeOrders.storeImageId, storeImages.id))

  return (
    <main>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <a href="/admin/store" className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </a>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Order {result[0].id}
          </h1>
          <Badge variant="outline" className="ml-auto sm:ml-0">
            {result[0].status}
          </Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm">
              Discard
            </Button>
            <Button size="sm">Save Product</Button>
          </div>
        </div>
        <OrderDetails orderId={params.id} />
      </div>
    </main>
  )
}