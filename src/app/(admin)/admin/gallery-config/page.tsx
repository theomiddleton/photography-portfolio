import { Suspense } from 'react'
import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import { imageData, mainGalleryConfig } from '~/server/db/schema'
import { DEFAULT_GALLERY_CONFIG } from '~/lib/types/gallery-config'
import { GalleryConfigurationPage } from './gallery-config-page'
import type { MainGalleryConfig } from '~/lib/types/gallery-config'
import type { PortfolioImageData } from '~/lib/types/image'

export default async function AdminGalleryConfigPage() {
  // Fetch current configuration
  const getMainGalleryConfig = async (): Promise<MainGalleryConfig> => {
    try {
      const config = await db
        .select()
        .from(mainGalleryConfig)
        .where(eq(mainGalleryConfig.id, 1))
        .limit(1)

      if (config.length === 0) {
        return DEFAULT_GALLERY_CONFIG
      }

      const dbConfig = config[0]!
      return {
        id: dbConfig.id,
        layout: (dbConfig.layout as MainGalleryConfig['layout']) || 'masonry',
        gridVariant: (dbConfig.gridVariant as MainGalleryConfig['gridVariant']) || 'standard',
        columnsMobile: dbConfig.columnsMobile,
        columnsTablet: dbConfig.columnsTablet,
        columnsDesktop: dbConfig.columnsDesktop,
        columnsLarge: dbConfig.columnsLarge,
        gapSize: (dbConfig.gapSize as MainGalleryConfig['gapSize']) || 'medium',
        borderRadius: (dbConfig.borderRadius as MainGalleryConfig['borderRadius']) || 'medium',
        aspectRatio: (dbConfig.aspectRatio as MainGalleryConfig['aspectRatio']) || 'auto',
        enableHeroImage: dbConfig.enableHeroImage,
        heroImageId: dbConfig.heroImageId,
        heroImagePosition: (dbConfig.heroImagePosition as MainGalleryConfig['heroImagePosition']) || 'top',
        heroImageSize: (dbConfig.heroImageSize as MainGalleryConfig['heroImageSize']) || 'large',
        heroImageStyle: (dbConfig.heroImageStyle as MainGalleryConfig['heroImageStyle']) || 'featured',
        enableStaggered: dbConfig.enableStaggered,
        enablePrioritySort: dbConfig.enablePrioritySort,
        priorityMode: (dbConfig.priorityMode as MainGalleryConfig['priorityMode']) || 'order',
        showImageTitles: dbConfig.showImageTitles,
        showImageDescriptions: dbConfig.showImageDescriptions,
        showImageMetadata: dbConfig.showImageMetadata,
        enableLightbox: dbConfig.enableLightbox,
        enableInfiniteScroll: dbConfig.enableInfiniteScroll,
        imagesPerPage: dbConfig.imagesPerPage,
        enableAnimations: dbConfig.enableAnimations,
        animationType: (dbConfig.animationType as MainGalleryConfig['animationType']) || 'fade',
        hoverEffect: (dbConfig.hoverEffect as MainGalleryConfig['hoverEffect']) || 'zoom',
        backgroundColor: (dbConfig.backgroundColor as MainGalleryConfig['backgroundColor']) || 'default',
        overlayColor: (dbConfig.overlayColor as MainGalleryConfig['overlayColor']) || 'black',
        overlayOpacity: dbConfig.overlayOpacity,
        enableLazyLoading: dbConfig.enableLazyLoading,
        imageQuality: (dbConfig.imageQuality as MainGalleryConfig['imageQuality']) || 'auto',
        enableProgressiveLoading: dbConfig.enableProgressiveLoading,
        updatedAt: dbConfig.updatedAt,
        updatedBy: dbConfig.updatedBy,
      }
    } catch (error) {
      console.error('Failed to fetch main gallery config:', error)
      return DEFAULT_GALLERY_CONFIG
    }
  }

  // Fetch sample images for preview
  const getSampleImages = async (): Promise<PortfolioImageData[]> => {
    try {
      const result = await db
        .select({
          id: imageData.id,
          uuid: imageData.uuid,
          fileName: imageData.fileName,
          fileUrl: imageData.fileUrl,
          name: imageData.name,
          description: imageData.description,
          tags: imageData.tags,
          visible: imageData.visible,
          order: imageData.order,
          priority: imageData.priority,
          isHero: imageData.isHero,
          fileSize: imageData.fileSize,
          uploadedAt: imageData.uploadedAt,
          modifiedAt: imageData.modifiedAt,
        })
        .from(imageData)
        .where(eq(imageData.visible, true))
        .orderBy(imageData.order)
        .limit(20) // Limit for preview

      return result.map((item) => ({
        id: item.id,
        uuid: item.uuid,
        fileName: item.fileName,
        fileUrl: item.fileUrl,
        name: item.name,
        description: item.description || undefined,
        tags: item.tags || undefined,
        visible: item.visible,
        order: item.order,
        priority: item.priority || undefined,
        isHero: item.isHero || undefined,
        fileSize: item.fileSize || undefined,
        uploadedAt: item.uploadedAt || new Date(),
        modifiedAt: item.modifiedAt || new Date(),
      }))
    } catch (error) {
      console.error('Failed to fetch sample images:', error)
      return []
    }
  }

  const [galleryConfig, sampleImages] = await Promise.all([
    getMainGalleryConfig(),
    getSampleImages()
  ])

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading configuration...</div>}>
        <GalleryConfigurationPage
          initialConfig={galleryConfig}
          sampleImages={sampleImages}
        />
      </Suspense>
    </div>
  )
}