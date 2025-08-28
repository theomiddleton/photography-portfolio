import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { notFound } from 'next/navigation'
import { AltImagePage } from '~/components/alt-image-page'
import type { Metadata } from 'next'
import { siteConfig } from '~/config/site'
import { generateImageStructuredData } from '~/lib/structured-data'
import Script from 'next/script'

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
      title: 'Photo Not Found | Photography Portfolio',
      description: 'The requested photograph could not be found in the portfolio.',
    }
  }

  const image = result[0]
  const canonicalUrl = `${siteConfig.url}/photo/${params.id}`
  
  // Enhanced title and description for SEO
  const title = image.name ? 
    `${image.name} | ${siteConfig.ownerName} Photography` : 
    `Photography by ${siteConfig.ownerName} | Professional Portfolio`
  
  const description = image.description ? 
    `${image.description} - Professional photography by ${siteConfig.ownerName}. View this stunning photograph and explore more in the portfolio.` :
    `Professional photograph by ${siteConfig.ownerName}. Explore this and more stunning images in the photography portfolio.`

  // Generate keywords from tags and add photography-specific terms
  const tagKeywords = image.tags ? image.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
  const keywords = [
    ...tagKeywords,
    `${siteConfig.ownerName} photography`,
    'professional photographer',
    'photography portfolio',
    'fine art photography',
    image.name ? image.name.toLowerCase() : 'photograph'
  ].join(', ')

  return {
    title,
    description,
    keywords,
    authors: [{ name: siteConfig.ownerName }],
    creator: siteConfig.ownerName,
    openGraph: {
      title,
      description,
      images: [{
        url: image.fileUrl,
        width: 1200,
        height: 630,
        alt: image.name || `Professional photograph by ${siteConfig.ownerName}`,
      }],
      url: canonicalUrl,
      siteName: siteConfig.seo.openGraph.siteName,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.fileUrl],
      creator: '@theomiddleton_',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
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
  
  const image: SelectedImageData = result[0]
  
  // Generate structured data for the image
  const imageStructuredData = generateImageStructuredData({
    image,
    baseUrl: siteConfig.url
  })
  
  return (
    <>
      {/* Structured Data for Image */}
      <Script
        id="image-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(imageStructuredData)
        }}
      />
      
      <AltImagePage 
        data={image} 
        prevImageUrl={prevImageUrl}
        nextImageUrl={nextImageUrl}
      />
    </>
  )
}