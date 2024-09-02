import { eq } from 'drizzle-orm'
import { SiteHeader } from '~/components/site-header'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getFlags } from '~/app/flags'
import { ImagePage } from '~/components/image-page'
import { AltImagePage } from '~/components/alt-image-page'

export const revalidate = 60
export const dynamicParams = true

export default async function Photo({ params }: { params: { id: number } }) {
  const flags = await getFlags()
  const showAltImagePage = flags.altImagePage

  const result = await db.select({
    id: imageData.id,
    fileUrl: imageData.fileUrl,
    name: imageData.name,
    description: imageData.description,
    tags: imageData.tags,
    uploadedAt: imageData.uploadedAt
  }).from(imageData).where(eq(imageData.id, params.id))

  if (result.length === 0) {
    notFound()
  }

  const image = result[0]
  return showAltImagePage ? <AltImagePage data={image} /> : <ImagePage data={image} />
}

export const runtime = 'edge'