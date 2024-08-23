import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"

import { db } from '~/server/db'
import { storeImages, imageData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export async function ProductDetails({ id }: { id: number }) {
  const result = await db.select({
    imageId: storeImages.imageId,
    imageName: imageData.name,
    imageDescription: imageData.description,
    imageFileUrl: storeImages.fileUrl,
    storeImageId: storeImages.id,
    price: storeImages.price,
    stock: storeImages.stock,
    visible : storeImages.visible,
    createdAt: storeImages.createdAt,
    })
  .from(storeImages)
  .innerJoin(imageData, eq(storeImages.imageId, imageData.id))
  .where(eq(storeImages.id, id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
        <CardDescription>
          View and edit product details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <div title="This is the title for the image, so it isn't editable here" className="border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-800">
              {result[0].imageName}
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <div title="This is the description for the image, so it isn't editable here" className="border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-800">
              {result[0].imageDescription}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  className="w-full"
                  defaultValue={result[0].price}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  className="w-full"
                  defaultValue={result[0].stock}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
