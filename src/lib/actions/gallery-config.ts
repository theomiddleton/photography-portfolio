'use server'

import { revalidatePath } from 'next/cache'
import { db } from '~/server/db'
import { galleryConfig } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export interface GalleryConfigData {
  columnsMobile: number
  columnsTablet: number
  columnsDesktop: number
  columnsLarge: number
  galleryStyle: 'masonry' | 'grid' | 'justified'
  gapSize: 'small' | 'medium' | 'large'
}

const defaultConfig: GalleryConfigData = {
  columnsMobile: 1,
  columnsTablet: 2,
  columnsDesktop: 3,
  columnsLarge: 4,
  galleryStyle: 'masonry',
  gapSize: 'medium',
}

export async function updateGalleryConfig(config: GalleryConfigData) {
  try {
    // First check if config exists
    const existing = await db
      .select()
      .from(galleryConfig)
      .where(eq(galleryConfig.id, 1))
      .limit(1)

    if (existing.length === 0) {
      // Create new config if none exists
      await db.insert(galleryConfig).values({
        id: 1,
        columnsMobile: config.columnsMobile,
        columnsTablet: config.columnsTablet,
        columnsDesktop: config.columnsDesktop,
        columnsLarge: config.columnsLarge,
        galleryStyle: config.galleryStyle,
        gapSize: config.gapSize,
      })
    } else {
      // Update existing config
      await db
        .update(galleryConfig)
        .set({
          columnsMobile: config.columnsMobile,
          columnsTablet: config.columnsTablet,
          columnsDesktop: config.columnsDesktop,
          columnsLarge: config.columnsLarge,
          galleryStyle: config.galleryStyle,
          gapSize: config.gapSize,
          updatedAt: new Date(),
        })
        .where(eq(galleryConfig.id, 1))
    }

    // Revalidate the main page to reflect changes immediately
    revalidatePath('/')
    revalidatePath('/admin/gallery')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to update gallery config:', error)
    return { success: false, error: 'Failed to update configuration' }
  }
}

export async function getGalleryConfig(): Promise<GalleryConfigData> {
  try {
    const result = await db
      .select()
      .from(galleryConfig)
      .where(eq(galleryConfig.id, 1))
      .limit(1)

    if (result.length === 0) {
      // Create default config in database if none exists
      await db.insert(galleryConfig).values({
        id: 1,
        ...defaultConfig,
      })
      
      return defaultConfig
    }

    return {
      columnsMobile: result[0]!.columnsMobile,
      columnsTablet: result[0]!.columnsTablet,
      columnsDesktop: result[0]!.columnsDesktop,
      columnsLarge: result[0]!.columnsLarge,
      galleryStyle: result[0]!.galleryStyle as 'masonry' | 'grid' | 'justified',
      gapSize: result[0]!.gapSize as 'small' | 'medium' | 'large',
    }
  } catch (error) {
    console.error('Failed to fetch gallery config:', error)
    // Return default config on error
    return defaultConfig
  }
}