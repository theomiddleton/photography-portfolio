import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { notFound } from 'next/navigation'
import { AltImagePage } from '~/components/alt-image-page'
import type { Metadata } from 'next'
import { siteConfig } from '~/config/site'

// Define a specific type for the selected data
interface SelectedImageData {
  id: number
  fileUrl: string
  name: string
  description: string
  tags: string
  uploadedAt: Date
}

// revalidate pages for new images every minute
// this ensures any recently uploaded images will be shown
export const revalidate = 60
export const dynamicParams = true

// Generate metadata for the page
export async function generateMetadata(props: { params: Promise<{ id: number }> }): Promise<Metadata> {
  const params = await props.params;

  // fetch image data from the database
  const result = await db
    .select({
      id: imageData.id,
      fileUrl: imageData.fileUrl,
      name: imageData.name,
      description: imageData.description,
      tags: imageData.tags,
    })
    .from(imageData)
    .where(eq(imageData.id, params.id))

  if (result.length === 0) {
    return {
      title: 'Photo Not Found',
    }
  }

  const image = result[0]
  const canonicalUrl = `${siteConfig.url}/photos/${params.id}`

  return {
    title: image.name,
    description: image.description,
    keywords: image.tags.split(',').map(tag => tag.trim()),
    openGraph: {
      title: image.name,
      description: image.description,
      images: [image.fileUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function Photo(props: { params: Promise<{ id: number }> }) {
  const params = await props.params;
  // fetch image data from the database
  const result = await db
    .select({
      id: imageData.id,
      fileUrl: imageData.fileUrl,
      name: imageData.name,
      description: imageData.description,
      tags: imageData.tags,
      uploadedAt: imageData.uploadedAt,
    })
    .from(imageData)
    .where(eq(imageData.id, params.id))

  // if no image is found, return a 404
  if (result.length === 0) {
    notFound()
  }

  // shows different page based on the flag, altImagePage is a cleaner look, whereas ImagePage shows tags and title etc
  const image: SelectedImageData = result[0]
  return <AltImagePage data={image} />
}