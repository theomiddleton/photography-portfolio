import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { storeImages, imageData, storeOrders } from '~/server/db/schema'

import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { ChevronLeft } from 'lucide-react'

import { OrderDetails } from '~/components/store/order-details'


export default async function Product({ params }: { params: { id: number } }) {

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
  .where(eq(storeOrders.id, params.id))
  .innerJoin(imageData, eq(storeOrders.storeImageId, imageData.id))
  .innerJoin(storeImages, eq(storeOrders.storeImageId, storeImages.id))

  console.log('Result:', result)

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
        <OrderDetails id={params.id} />
      </div>
    </main>
  )
}