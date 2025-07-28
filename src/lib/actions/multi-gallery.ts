'use server'

import { revalidatePath } from 'next/cache'
import { db } from '~/server/db'
import { 
  multiGalleryPages, 
  multiGallerySections, 
  multiGallerySectionImages, 
  multiGallerySeparators,
  imageData
} from '~/server/db/schema'
import { eq, and, desc, asc } from 'drizzle-orm'
import type {
  CreateMultiGalleryPageRequest,
  UpdateMultiGalleryPageRequest,
  CreateMultiGallerySectionRequest,
  UpdateMultiGallerySectionRequest,
  CreateMultiGallerySeparatorRequest,
  UpdateMultiGallerySeparatorRequest,
  MultiGalleryPageResponse,
  MultiGalleryPageListResponse,
  MultiGallerySectionResponse,
  MultiGallerySeparatorResponse,
  MultiGalleryPageConfig,
  MultiGallerySectionWithImages,
  MultiGallerySeparatorWithConfig,
  SeparatorConfig
} from '~/lib/types/multi-gallery'

// PAGE ACTIONS

export async function createMultiGalleryPage(
  data: CreateMultiGalleryPageRequest
): Promise<MultiGalleryPageResponse> {
  try {
    const [page] = await db.insert(multiGalleryPages).values({
      slug: data.slug,
      title: data.title,
      description: data.description,
      isPublic: data.isPublic ?? false,
      showInNav: data.showInNav ?? false,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    }).returning()

    if (!page) {
      return { success: false, error: 'Failed to create page' }
    }

    revalidatePath('/admin/multi-galleries')
    return { success: true, data: { ...page, sections: [], separators: [] } }
  } catch (error) {
    console.error('Failed to create multi-gallery page:', error)
    return { success: false, error: 'Failed to create page' }
  }
}

export async function updateMultiGalleryPage(
  data: UpdateMultiGalleryPageRequest
): Promise<MultiGalleryPageResponse> {
  try {
    const { id, ...updateData } = data
    const [page] = await db
      .update(multiGalleryPages)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(multiGalleryPages.id, id))
      .returning()

    if (!page) {
      return { success: false, error: 'Page not found' }
    }

    const pageWithData = await getMultiGalleryPageById(id)
    if (!pageWithData.success || !pageWithData.data) {
      return { success: false, error: 'Failed to fetch updated page' }
    }

    revalidatePath(`/admin/multi-galleries/${id}`)
    revalidatePath(`/mg/${page.slug}`)
    return { success: true, data: pageWithData.data }
  } catch (error) {
    console.error('Failed to update multi-gallery page:', error)
    return { success: false, error: 'Failed to update page' }
  }
}

export async function deleteMultiGalleryPage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(multiGalleryPages).where(eq(multiGalleryPages.id, id))
    
    revalidatePath('/admin/multi-galleries')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete multi-gallery page:', error)
    return { success: false, error: 'Failed to delete page' }
  }
}

export async function getMultiGalleryPages(): Promise<MultiGalleryPageListResponse> {
  try {
    const pages = await db
      .select()
      .from(multiGalleryPages)
      .orderBy(desc(multiGalleryPages.updatedAt))

    return { success: true, data: pages }
  } catch (error) {
    console.error('Failed to fetch multi-gallery pages:', error)
    return { success: false, error: 'Failed to fetch pages' }
  }
}

export async function getMultiGalleryPageById(id: string): Promise<MultiGalleryPageResponse> {
  try {
    // Get page
    const [page] = await db
      .select()
      .from(multiGalleryPages)
      .where(eq(multiGalleryPages.id, id))

    if (!page) {
      return { success: false, error: 'Page not found' }
    }

    // Get sections with images
    const sectionsData = await db
      .select()
      .from(multiGallerySections)
      .where(eq(multiGallerySections.pageId, id))
      .orderBy(asc(multiGallerySections.order))

    const sections: MultiGallerySectionWithImages[] = await Promise.all(
      sectionsData.map(async (section) => {
        const sectionImages = await db
          .select({
            id: multiGallerySectionImages.id,
            sectionId: multiGallerySectionImages.sectionId,
            order: multiGallerySectionImages.order,
            addedAt: multiGallerySectionImages.addedAt,
            image: {
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
              uploadedAt: imageData.uploadedAt,
              modifiedAt: imageData.modifiedAt,
            }
          })
          .from(multiGallerySectionImages)
          .innerJoin(imageData, eq(multiGallerySectionImages.imageId, imageData.id))
          .where(eq(multiGallerySectionImages.sectionId, section.id))
          .orderBy(asc(multiGallerySectionImages.order))

        return {
          ...section,
          images: sectionImages.map(img => ({
            id: img.id,
            sectionId: img.sectionId,
            order: img.order,
            addedAt: img.addedAt,
            image: {
              id: img.image.id,
              uuid: img.image.uuid,
              fileName: img.image.fileName,
              fileUrl: img.image.fileUrl,
              name: img.image.name,
              description: img.image.description || undefined,
              tags: img.image.tags || undefined,
              visible: img.image.visible,
              order: img.image.order,
              priority: img.image.priority || undefined,
              isHero: img.image.isHero || undefined,
              uploadedAt: img.image.uploadedAt || new Date(),
              modifiedAt: img.image.modifiedAt || new Date(),
            }
          }))
        }
      })
    )

    // Get separators
    const separatorsData = await db
      .select()
      .from(multiGallerySeparators)
      .where(eq(multiGallerySeparators.pageId, id))
      .orderBy(asc(multiGallerySeparators.position))

    const separators: MultiGallerySeparatorWithConfig[] = separatorsData.map(sep => ({
      ...sep,
      config: {
        type: sep.type as SeparatorConfig['type'],
        content: sep.content || undefined,
        height: sep.height || undefined,
        style: (sep.style as SeparatorConfig['style']) || undefined,
      }
    }))

    const pageConfig: MultiGalleryPageConfig = {
      ...page,
      sections,
      separators,
    }

    return { success: true, data: pageConfig }
  } catch (error) {
    console.error('Failed to fetch multi-gallery page:', error)
    return { success: false, error: 'Failed to fetch page' }
  }
}

export async function getMultiGalleryPageBySlug(slug: string): Promise<MultiGalleryPageResponse> {
  try {
    // Get page
    const [page] = await db
      .select()
      .from(multiGalleryPages)
      .where(eq(multiGalleryPages.slug, slug))

    if (!page) {
      return { success: false, error: 'Page not found' }
    }

    return getMultiGalleryPageById(page.id)
  } catch (error) {
    console.error('Failed to fetch multi-gallery page by slug:', error)
    return { success: false, error: 'Failed to fetch page' }
  }
}

// SECTION ACTIONS

export async function createMultiGallerySection(
  data: CreateMultiGallerySectionRequest
): Promise<MultiGallerySectionResponse> {
  try {
    const { imageIds, config, ...sectionData } = data

    const [section] = await db.insert(multiGallerySections).values({
      ...sectionData,
      // Map config to database columns
      layout: config.layout,
      gridVariant: config.gridVariant,
      columnsMobile: config.columnsMobile,
      columnsTablet: config.columnsTablet,
      columnsDesktop: config.columnsDesktop,
      columnsLarge: config.columnsLarge,
      gapSize: config.gapSize,
      borderRadius: config.borderRadius,
      aspectRatio: config.aspectRatio,
      enableHeroImage: config.enableHeroImage,
      heroImageId: config.heroImageId,
      heroImagePosition: config.heroImagePosition,
      heroImageSize: config.heroImageSize,
      heroImageStyle: config.heroImageStyle,
      showImageTitles: config.showImageTitles,
      showImageDescriptions: config.showImageDescriptions,
      showImageMetadata: config.showImageMetadata,
      enableLightbox: config.enableLightbox,
      enableInfiniteScroll: config.enableInfiniteScroll,
      imagesPerPage: config.imagesPerPage,
      enableAnimations: config.enableAnimations,
      animationType: config.animationType,
      hoverEffect: config.hoverEffect,
      backgroundColor: config.backgroundColor,
      overlayColor: config.overlayColor,
      overlayOpacity: config.overlayOpacity,
      enableLazyLoading: config.enableLazyLoading,
      imageQuality: config.imageQuality,
      enableProgressiveLoading: config.enableProgressiveLoading,
    }).returning()

    if (!section) {
      return { success: false, error: 'Failed to create section' }
    }

    // Add images to section
    if (imageIds.length > 0) {
      await db.insert(multiGallerySectionImages).values(
        imageIds.map((imageId, index) => ({
          sectionId: section.id,
          imageId,
          order: index,
        }))
      )
    }

    revalidatePath(`/admin/multi-galleries/${data.pageId}`)
    
    // Get the section with images for response
    const sectionWithImages = await getSectionWithImages(section.id)
    return { success: true, data: sectionWithImages }
  } catch (error) {
    console.error('Failed to create multi-gallery section:', error)
    return { success: false, error: 'Failed to create section' }
  }
}

export async function updateMultiGallerySection(
  data: UpdateMultiGallerySectionRequest
): Promise<MultiGallerySectionResponse> {
  try {
    const { id, imageIds, config, ...updateData } = data

    // Update section
    const updateValues: any = { ...updateData, updatedAt: new Date() }
    
    if (config) {
      Object.assign(updateValues, {
        layout: config.layout,
        gridVariant: config.gridVariant,
        columnsMobile: config.columnsMobile,
        columnsTablet: config.columnsTablet,
        columnsDesktop: config.columnsDesktop,
        columnsLarge: config.columnsLarge,
        gapSize: config.gapSize,
        borderRadius: config.borderRadius,
        aspectRatio: config.aspectRatio,
        enableHeroImage: config.enableHeroImage,
        heroImageId: config.heroImageId,
        heroImagePosition: config.heroImagePosition,
        heroImageSize: config.heroImageSize,
        heroImageStyle: config.heroImageStyle,
        showImageTitles: config.showImageTitles,
        showImageDescriptions: config.showImageDescriptions,
        showImageMetadata: config.showImageMetadata,
        enableLightbox: config.enableLightbox,
        enableInfiniteScroll: config.enableInfiniteScroll,
        imagesPerPage: config.imagesPerPage,
        enableAnimations: config.enableAnimations,
        animationType: config.animationType,
        hoverEffect: config.hoverEffect,
        backgroundColor: config.backgroundColor,
        overlayColor: config.overlayColor,
        overlayOpacity: config.overlayOpacity,
        enableLazyLoading: config.enableLazyLoading,
        imageQuality: config.imageQuality,
        enableProgressiveLoading: config.enableProgressiveLoading,
      })
    }

    await db
      .update(multiGallerySections)
      .set(updateValues)
      .where(eq(multiGallerySections.id, id))

    // Update images if provided
    if (imageIds) {
      // Remove existing images
      await db.delete(multiGallerySectionImages).where(eq(multiGallerySectionImages.sectionId, id))
      
      // Add new images
      if (imageIds.length > 0) {
        await db.insert(multiGallerySectionImages).values(
          imageIds.map((imageId, index) => ({
            sectionId: id,
            imageId,
            order: index,
          }))
        )
      }
    }

    // Get page ID for revalidation
    const [section] = await db
      .select({ pageId: multiGallerySections.pageId })
      .from(multiGallerySections)
      .where(eq(multiGallerySections.id, id))

    if (section) {
      revalidatePath(`/admin/multi-galleries/${section.pageId}`)
    }

    // Get the section with images for response
    const sectionWithImages = await getSectionWithImages(id)
    return { success: true, data: sectionWithImages }
  } catch (error) {
    console.error('Failed to update multi-gallery section:', error)
    return { success: false, error: 'Failed to update section' }
  }
}

export async function deleteMultiGallerySection(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get page ID for revalidation
    const [section] = await db
      .select({ pageId: multiGallerySections.pageId })
      .from(multiGallerySections)
      .where(eq(multiGallerySections.id, id))

    await db.delete(multiGallerySections).where(eq(multiGallerySections.id, id))
    
    if (section) {
      revalidatePath(`/admin/multi-galleries/${section.pageId}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Failed to delete multi-gallery section:', error)
    return { success: false, error: 'Failed to delete section' }
  }
}

// SEPARATOR ACTIONS

export async function createMultiGallerySeparator(
  data: CreateMultiGallerySeparatorRequest
): Promise<MultiGallerySeparatorResponse> {
  try {
    const [separator] = await db.insert(multiGallerySeparators).values({
      pageId: data.pageId,
      position: data.position,
      type: data.config.type,
      content: data.config.content,
      height: data.config.height,
      style: data.config.style,
    }).returning()

    if (!separator) {
      return { success: false, error: 'Failed to create separator' }
    }

    revalidatePath(`/admin/multi-galleries/${data.pageId}`)
    
    const separatorWithConfig: MultiGallerySeparatorWithConfig = {
      ...separator,
      config: data.config,
    }

    return { success: true, data: separatorWithConfig }
  } catch (error) {
    console.error('Failed to create multi-gallery separator:', error)
    return { success: false, error: 'Failed to create separator' }
  }
}

export async function updateMultiGallerySeparator(
  data: UpdateMultiGallerySeparatorRequest
): Promise<MultiGallerySeparatorResponse> {
  try {
    const { id, config, ...updateData } = data

    const updateValues: any = { ...updateData }
    
    if (config) {
      Object.assign(updateValues, {
        type: config.type,
        content: config.content,
        height: config.height,
        style: config.style,
      })
    }

    const [separator] = await db
      .update(multiGallerySeparators)
      .set(updateValues)
      .where(eq(multiGallerySeparators.id, id))
      .returning()

    if (!separator) {
      return { success: false, error: 'Separator not found' }
    }

    revalidatePath(`/admin/multi-galleries/${separator.pageId}`)
    
    const separatorWithConfig: MultiGallerySeparatorWithConfig = {
      ...separator,
      config: config || {
        type: separator.type as SeparatorConfig['type'],
        content: separator.content || undefined,
        height: separator.height || undefined,
        style: (separator.style as SeparatorConfig['style']) || undefined,
      },
    }

    return { success: true, data: separatorWithConfig }
  } catch (error) {
    console.error('Failed to update multi-gallery separator:', error)
    return { success: false, error: 'Failed to update separator' }
  }
}

export async function deleteMultiGallerySeparator(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get page ID for revalidation
    const [separator] = await db
      .select({ pageId: multiGallerySeparators.pageId })
      .from(multiGallerySeparators)
      .where(eq(multiGallerySeparators.id, id))

    await db.delete(multiGallerySeparators).where(eq(multiGallerySeparators.id, id))
    
    if (separator) {
      revalidatePath(`/admin/multi-galleries/${separator.pageId}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Failed to delete multi-gallery separator:', error)
    return { success: false, error: 'Failed to delete separator' }
  }
}

// HELPER FUNCTIONS

async function getSectionWithImages(sectionId: string): Promise<MultiGallerySectionWithImages> {
  const [section] = await db
    .select()
    .from(multiGallerySections)
    .where(eq(multiGallerySections.id, sectionId))

  if (!section) {
    throw new Error('Section not found')
  }

  const sectionImages = await db
    .select({
      id: multiGallerySectionImages.id,
      sectionId: multiGallerySectionImages.sectionId,
      order: multiGallerySectionImages.order,
      addedAt: multiGallerySectionImages.addedAt,
      image: {
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
        uploadedAt: imageData.uploadedAt,
        modifiedAt: imageData.modifiedAt,
      }
    })
    .from(multiGallerySectionImages)
    .innerJoin(imageData, eq(multiGallerySectionImages.imageId, imageData.id))
    .where(eq(multiGallerySectionImages.sectionId, sectionId))
    .orderBy(asc(multiGallerySectionImages.order))

  return {
    ...section,
    images: sectionImages.map(img => ({
      id: img.id,
      sectionId: img.sectionId,
      order: img.order,
      addedAt: img.addedAt,
      image: {
        id: img.image.id,
        uuid: img.image.uuid,
        fileName: img.image.fileName,
        fileUrl: img.image.fileUrl,
        name: img.image.name,
        description: img.image.description || undefined,
        tags: img.image.tags || undefined,
        visible: img.image.visible,
        order: img.image.order,
        priority: img.image.priority || undefined,
        isHero: img.image.isHero || undefined,
        uploadedAt: img.image.uploadedAt || new Date(),
        modifiedAt: img.image.modifiedAt || new Date(),
      }
    }))
  }
}

// UTILITY ACTIONS

export async function reorderMultiGallerySections(
  pageId: string,
  sectionOrders: { id: string; order: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await Promise.all(
      sectionOrders.map(({ id, order }) =>
        db.update(multiGallerySections)
          .set({ order, updatedAt: new Date() })
          .where(eq(multiGallerySections.id, id))
      )
    )

    revalidatePath(`/admin/multi-galleries/${pageId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to reorder sections:', error)
    return { success: false, error: 'Failed to reorder sections' }
  }
}

export async function reorderSectionImages(
  sectionId: string,
  imageOrders: { id: string; order: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await Promise.all(
      imageOrders.map(({ id, order }) =>
        db.update(multiGallerySectionImages)
          .set({ order })
          .where(eq(multiGallerySectionImages.id, id))
      )
    )

    // Get page ID for revalidation
    const [section] = await db
      .select({ pageId: multiGallerySections.pageId })
      .from(multiGallerySections)
      .where(eq(multiGallerySections.id, sectionId))

    if (section) {
      revalidatePath(`/admin/multi-galleries/${section.pageId}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to reorder section images:', error)
    return { success: false, error: 'Failed to reorder section images' }
  }
}