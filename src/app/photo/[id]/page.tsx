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

// Using on-demand revalidation instead of time-based revalidation
// dynamicParams is used to tell nextjs to generate the page for each new image
// This page will be revalidated when images are uploaded or deleted via the API
export const revalidate = 3600 // Set to 1 hour as a fallback, primarily using on-demand revalidation
export const dynamicParams = true

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: number } }): Promise<Metadata> {
  
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

export default async function Photo({ params }: { params: { id: number } }) {
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