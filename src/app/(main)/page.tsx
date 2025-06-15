import React from 'react'
import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import { imageData, galleryConfig } from '~/server/db/schema'
import { siteConfig } from '~/config/site'
import { ImageGallery } from '~/components/image-gallery-grid'
import type { GalleryConfigData } from '~/lib/actions/gallery-config'

export const revalidate = 3600 // Set to 1 hour as a fallback, primarily using on-demand revalidation

export default async function Home() {
  // Get only visible image data from the database, ordered by the 'order' field
  const result = await db
    .select({
      id: imageData.id,
      description: imageData.description,
      order: imageData.order,
      fileUrl: imageData.fileUrl,
      name: imageData.name,
    })
    .from(imageData)
    .where(eq(imageData.visible, true))
    .orderBy(imageData.order)

  const imageUrls = result.map((item) => ({
    id: item.id,
    description: item.description,
    order: item.order,
    url: item.fileUrl,
    name: item.name,
  }))

  // Fetch gallery configuration
  const getGalleryConfig = async (): Promise<GalleryConfigData> => {
    const defaultConfig: GalleryConfigData = {
      columnsMobile: 1,
      columnsTablet: 2,
      columnsDesktop: 3,
      columnsLarge: 4,
      galleryStyle: 'masonry',
      gapSize: 'medium',
    }

    try {
      const gallery = await db
        .select()
        .from(galleryConfig)
        .where(eq(galleryConfig.id, 1))
        .limit(1)

      if (gallery.length === 0) {
        return defaultConfig
      }

      const config = gallery[0]!
      return {
        columnsMobile: config.columnsMobile,
        columnsTablet: config.columnsTablet,
        columnsDesktop: config.columnsDesktop,
        columnsLarge: config.columnsLarge,
        galleryStyle: config.galleryStyle as 'masonry' | 'grid' | 'justified',
        gapSize: config.gapSize as 'small' | 'medium' | 'large',
      }
    } catch (error) {
      console.error('Failed to fetch gallery config:', error)
      return defaultConfig
    }
  }

  const galleryConfigValue = await getGalleryConfig()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">      
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="font-serif text-5xl tracking-tight sm:text-[5rem]">
          {siteConfig.headers.main && <div>{siteConfig.headers.main}</div>}
        </h1>
        <ImageGallery images={imageUrls} config={galleryConfigValue} />
      </div>
    </main>
  )
}
