import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { imageData, storeImages } from '~/server/db/schema'

export async function fetchImg(id: number) {
  const result = await db.select({
    id: imageData.id,
    fileUrl: imageData.fileUrl,
    name: imageData.name,
    price: storeImages.price,
    description: imageData.description,
    uploadedAt: imageData.uploadedAt
  }).from(imageData).where(eq(imageData.id, id))
  .innerJoin(storeImages, eq(imageData.id, storeImages.imageId))

  if (result.length === 0) {
    return null
  }
  
  return {
    ...result[0]
  }
}