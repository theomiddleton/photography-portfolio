import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

import { db } from '~/server/db'
import { storeImages, imageData, storeOrders } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { ImageIdChart } from '~/components/store/charts/imageId-chart'
import { Revenue } from '~/components/store/charts/revenue'

const result = await db.select({
  id: storeOrders.id,
  storeImageId: storeImages.id,
  imageId: storeImages.imageId,
  quantity: storeOrders.quantity,
  price: storeImages.price,
  total: storeOrders.total,
  createdAt: storeOrders.createdAt,
})
.from(storeOrders)
.leftJoin(storeImages, eq(storeOrders.storeImageId, storeImages.id))

const orders = result.map((item) => ({
  id: item.id,
  storeImageId: item.storeImageId,
  imageId: item.imageId,
  quantity: item.quantity,
  price: item.price,
  total: item.total,
  createdAt: item.createdAt,
}))

const revOrders = result.map((item) => ({
  id: item.id,
  storeImageId: item.storeImageId,
  imageId: item.imageId,
  quantity: item.quantity,
  price: item.price,
  total: item.total,
  createdAt: item.createdAt.toISOString(),
}))

export function Analytics() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          View your store's analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-cols-fr">
          <div className="min-w-0">
            <ImageIdChart data={orders} />
          </div>
          <div className="min-w-0">
            <Revenue data={revOrders} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
