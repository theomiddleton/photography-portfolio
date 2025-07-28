'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '~/server/db'
import { mainGalleryConfig } from '~/server/db/schema'
import { getSession } from '~/lib/auth/auth'
import type { MainGalleryConfig } from '~/lib/types/gallery-config'

export async function getMainGalleryConfig(): Promise<MainGalleryConfig | null> {
  try {
    const config = await db.select().from(mainGalleryConfig).where(eq(mainGalleryConfig.id, 1)).limit(1)
    if (!config[0]) return null

    // Map fields to correct types if necessary
    const mappedConfig: MainGalleryConfig = {
      ...config[0],
      layout: config[0].layout as MainGalleryConfig['layout'],
      gridVariant: config[0].gridVariant as MainGalleryConfig['gridVariant'],
      gapSize: config[0].gapSize as MainGalleryConfig['gapSize'],
      borderRadius: config[0].borderRadius as MainGalleryConfig['borderRadius'],
      aspectRatio: config[0].aspectRatio as MainGalleryConfig['aspectRatio'],
      heroImagePosition: config[0].heroImagePosition as MainGalleryConfig['heroImagePosition'],
      heroImageSize: config[0].heroImageSize as MainGalleryConfig['heroImageSize'],
      heroImageStyle: config[0].heroImageStyle as MainGalleryConfig['heroImageStyle'],
      priorityMode: config[0].priorityMode as MainGalleryConfig['priorityMode'],
      animationType: config[0].animationType as MainGalleryConfig['animationType'],
      hoverEffect: config[0].hoverEffect as MainGalleryConfig['hoverEffect'],
      backgroundColor: config[0].backgroundColor as MainGalleryConfig['backgroundColor'],
      overlayColor: config[0].overlayColor as MainGalleryConfig['overlayColor'],
      imageQuality: config[0].imageQuality as MainGalleryConfig['imageQuality'],
    }

    return mappedConfig
  } catch (error) {
    console.error('Error fetching main gallery config:', error)
    return null
  }
}

export async function updateMainGalleryConfig(
  updates: Partial<Omit<MainGalleryConfig, 'id' | 'updatedAt' | 'updatedBy'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'Authentication required' }
    }

    const userId = Number(session.id)
    if (Number.isNaN(userId)) {
      return { success: false, error: 'Invalid user ID' }
    }

    // Check if config exists
    const existingConfig = await db
      .select()
      .from(mainGalleryConfig)
      .where(eq(mainGalleryConfig.id, 1))
      .limit(1)

    const configData = {
      ...updates,
      updatedAt: new Date(),
      updatedBy: userId,
    }

    if (existingConfig.length === 0) {
      // Create new config
      await db.insert(mainGalleryConfig).values({
        id: 1,
        ...configData,
      })
    } else {
      // Update existing config
      await db
        .update(mainGalleryConfig)
        .set(configData)
        .where(eq(mainGalleryConfig.id, 1))
    }

    // Revalidate the main gallery page
    revalidatePath('/')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error updating main gallery config:', error)
    return { success: false, error: 'Failed to update configuration' }
  }
}

export async function resetMainGalleryConfig(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'Authentication required' }
    }

    const userId = Number(session.id)
    if (Number.isNaN(userId)) {
      return { success: false, error: 'Invalid user ID' }
    }

    // Reset to default values
    await db
      .update(mainGalleryConfig)
      .set({
        layout: 'masonry',
        gridVariant: 'standard',
        columnsMobile: 1,
        columnsTablet: 2,
        columnsDesktop: 3,
        columnsLarge: 4,
        gapSize: 'medium',
        borderRadius: 'medium',
        aspectRatio: 'auto',
        enableHeroImage: false,
        heroImageId: null,
        heroImagePosition: 'top',
        heroImageSize: 'large',
        heroImageStyle: 'featured',
        enableStaggered: false,
        enablePrioritySort: false,
        priorityMode: 'order',
        showImageTitles: true,
        showImageDescriptions: false,
        showImageMetadata: false,
        enableLightbox: true,
        enableInfiniteScroll: false,
        imagesPerPage: 50,
        enableAnimations: true,
        animationType: 'fade',
        hoverEffect: 'zoom',
        backgroundColor: 'default',
        overlayColor: 'black',
        overlayOpacity: 50,
        enableLazyLoading: true,
        imageQuality: 'auto',
        enableProgressiveLoading: true,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(mainGalleryConfig.id, 1))

    revalidatePath('/')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error resetting main gallery config:', error)
    return { success: false, error: 'Failed to reset configuration' }
  }
}