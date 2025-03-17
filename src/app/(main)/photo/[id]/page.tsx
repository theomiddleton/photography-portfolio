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

export const revalidate = 3600
export const dynamicParams = true

// Generate metadata for the page
export async function generateMetadata(props: { params: Promise<{ id: number }> }): Promise<Metadata> {
  const params = await props.params

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
  const params = await props.params
  const currentId = Number(params.id)
  
  // Fetch current image data
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
    .where(eq(imageData.id, currentId))

  // If no image is found, return a 404
  if (result.length === 0) {
    notFound()
  }

  // Fetch adjacent images for preloading
  const [prevImage, nextImage] = await Promise.all([
    // Previous image (if current is not the first)
    currentId > 1 ? db
      .select({ fileUrl: imageData.fileUrl })
      .from(imageData)
      .where(eq(imageData.id, currentId - 1))
      .limit(1) : Promise.resolve([]),
    
    // Next image
    db
      .select({ fileUrl: imageData.fileUrl })
      .from(imageData)
      .where(eq(imageData.id, currentId + 1))
      .limit(1)
  ])

  // Extract URLs or set to undefined if not found
  const prevImageUrl = prevImage.length > 0 ? prevImage[0].fileUrl : undefined
  const nextImageUrl = nextImage.length > 0 ? nextImage[0].fileUrl : undefined
  
  // Shows different page based on the flag, altImagePage is a cleaner look
  const image: SelectedImageData = result[0]
  return <AltImagePage 
    data={image} 
    prevImageUrl={prevImageUrl}
    nextImageUrl={nextImageUrl}
  />
}