import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { notFound } from 'next/navigation'
import { getFlags } from '~/app/flags'
import { ImagePage } from '~/components/image-page'
import { AltImagePage } from '~/components/alt-image-page'

// revalidate pages for new images every minute
// this ensures any recently uploaded images will be shown  
export const revalidate = 60
export const dynamicParams = true

export default async function Photo({ params }: { params: { id: number } }) {
  const flags = await getFlags()
  const showAltImagePage = flags.altImagePage

  // fetch image data from the database
  const result = await db.select({
    id: imageData.id,
    fileUrl: imageData.fileUrl,
    name: imageData.name,
    description: imageData.description,
    tags: imageData.tags,
    uploadedAt: imageData.uploadedAt
  }).from(imageData).where(eq(imageData.id, params.id))

  // if no image is found, return a 404
  if (result.length === 0) {
    notFound()
  }
  
  // shows different page based on the flag, altImagePage is a cleaner look, whereas ImagePage shows tags and title ect
  const image = result[0]
  // return showAltImagePage ? <AltImagePage data={image} /> : <ImagePage data={image} />
  return <AltImagePage data={image} />
}