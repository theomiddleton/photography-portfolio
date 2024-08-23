import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Label } from "~/components/ui/label"

import { EditableField } from '~/components/store/editable-product-details'

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

  if (!result || result.length === 0) {
    return <div>No product found</div>
  }

  const product = result[0]

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
              {product.imageName}
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <div title="This is the description for the image, so it isn't editable here" className="border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-800">
              {product.imageDescription}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="flex gap-4">
              <EditableField id="price" label="Price" defaultValue={product.price} />
              <EditableField id="stock" label="Stock" defaultValue={product.stock} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
