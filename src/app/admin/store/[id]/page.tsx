import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { storeImages, imageData } from '~/server/db/schema'
import Image from 'next/image'

import { ProductDetails } from '~/components/store/product-details'
import { ProductVisibility } from '~/components/store/product-visibility'


export default async function Product({ params }: { params: { id: number } }) {

  const result = await db.select({
    id: storeImages.id,
    fileUrl: imageData.fileUrl,
    name: imageData.name,
    description: imageData.description,
    price: storeImages.price,
    stock: storeImages.stock,
    visible: storeImages.visible,
    createdAt: storeImages.createdAt
  }).from(storeImages)
  .where(eq(imageData.id, params.id))
  .innerJoin(imageData, eq(storeImages.imageId, imageData.id))

  return (
    <main>
      <div className="space-y-6">
        <ProductDetails id={params.id} />
        <ProductVisibility id={params.id} />
      </div>
    </main>
  )
}