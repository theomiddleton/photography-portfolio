import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { DeleteTable } from '~/components/delete/delete-table'
import { ImageReorder } from '~/components/image-reorder'

// Define a type for our image data
export type ImageDataType = typeof imageData.$inferSelect

export const revalidate = 5
export const dynamicParams = true

async function getImages(): Promise<ImageDataType[]> {
  return await db.select().from(imageData)
}

export default async function ImageManagementPage() {
  const images = await getImages()

  return (
    <div className="min-h-screen container mx-auto bg-white text-black space-y-12 py-10">
      <DeleteTable images={images} />
      <ImageReorder images={images} />
    </div>
  )
}