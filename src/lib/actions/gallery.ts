'use server'

import { db } from '~/server/db'
import { galleries, galleryImages } from '~/server/db/schema'
import { eq, desc, asc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logAction } from '~/lib/logging'
import { gallerySchema } from '~/lib/types/galleryType'

// Get all galleries
export async function getGalleries(includePrivate = false) {
  try {
    const result = await db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
        description: galleries.description,
        layout: galleries.layout,
        columns: galleries.columns,
        isPublic: galleries.isPublic,
        viewCount: galleries.viewCount,
        createdAt: galleries.createdAt,
        updatedAt: galleries.updatedAt,
        imageCount: galleryImages.id,
      })
      .from(galleries)
      .leftJoin(galleryImages, eq(galleries.id, galleryImages.galleryId))
      .where(includePrivate ? undefined : eq(galleries.isPublic, true))
      .orderBy(desc(galleries.createdAt))

    // Group by gallery and count images
    const galleryMap = new Map()
    result.forEach(row => {
      const galleryId = row.id
      if (!galleryMap.has(galleryId)) {
        galleryMap.set(galleryId, {
          ...row,
          imageCount: 0,
        })
      }
      if (row.imageCount) {
        galleryMap.get(galleryId).imageCount += 1
      }
    })

    return Array.from(galleryMap.values())
  } catch (error) {
    console.error('Error fetching galleries:', error)
    throw new Error('Failed to fetch galleries')
  }
}

// Get gallery by slug with images
export async function getGalleryBySlug(slug: string, includePrivate = false) {
  try {
    const [gallery] = await db
      .select()
      .from(galleries)
      .where(eq(galleries.slug, slug))
      .limit(1)

    if (!gallery) {
      return null
    }

    if (!includePrivate && !gallery.isPublic) {
      return null
    }

    const images = await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.galleryId, gallery.id))
      .orderBy(asc(galleryImages.order), asc(galleryImages.uploadedAt))

    return {
      ...gallery,
      images,
    }
  } catch (error) {
    console.error('Error fetching gallery:', error)
    throw new Error('Failed to fetch gallery')
  }
}

// Get gallery by ID with images (for admin)
export async function getGalleryById(id: string) {
  try {
    const [gallery] = await db
      .select()
      .from(galleries)
      .where(eq(galleries.id, id))
      .limit(1)

    if (!gallery) {
      return null
    }

    const images = await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.galleryId, gallery.id))
      .orderBy(asc(galleryImages.order), asc(galleryImages.uploadedAt))

    return {
      ...gallery,
      images,
    }
  } catch (error) {
    console.error('Error fetching gallery by ID:', error)
    throw new Error('Failed to fetch gallery')
  }
}

// Create gallery
export async function createGallery(data: z.infer<typeof gallerySchema>) {
  try {
    const validatedData = gallerySchema.parse(data)

    // Check if slug already exists
    const [existingGallery] = await db
      .select({ id: galleries.id })
      .from(galleries)
      .where(eq(galleries.slug, validatedData.slug))
      .limit(1)

    if (existingGallery) {
      return { gallery: null, error: 'Gallery with this slug already exists' }
    }

    const [newGallery] = await db
      .insert(galleries)
      .values({
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        layout: validatedData.layout,
        columns: validatedData.columns as { mobile: number; tablet: number; desktop: number },
        isPublic: validatedData.isPublic,
        category: validatedData.category,
        tags: validatedData.tags,
        template: validatedData.template,
        allowEmbedding: validatedData.allowEmbedding,
        embedPassword: validatedData.embedPassword,
        shareableLink: crypto.randomUUID(), // Generate initial shareable link
        showInNav: validatedData.showInNav,
      })
      .returning()

    logAction('Gallery', `Created gallery: ${newGallery.title}`)
    revalidatePath('/admin/galleries')
    revalidatePath(`/g/${newGallery.slug}`)
    revalidatePath('/') // Revalidate home page to update navigation

    return { gallery: newGallery, error: null }
  } catch (error) {
    console.error('Error creating gallery:', error)
    if (error instanceof z.ZodError) {
      return { gallery: null, error: error.errors }
    }
    return { gallery: null, error: 'Failed to create gallery' }
  }
}

// Update gallery
export async function updateGallery(id: string, data: Partial<z.infer<typeof gallerySchema>>) {
  try {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }
    
    // Ensure columns has correct type if provided
    if (data.columns) {
      updateData.columns = data.columns as { mobile: number; tablet: number; desktop: number }
    }

    const [updatedGallery] = await db
      .update(galleries)
      .set(updateData)
      .where(eq(galleries.id, id))
      .returning()

    logAction('Gallery', `Updated gallery: ${updatedGallery.title}`)
    revalidatePath('/admin/galleries')
    revalidatePath(`/g/${updatedGallery.slug}`)
    revalidatePath('/') // Revalidate home page to update navigation

    return { gallery: updatedGallery, error: null }
  } catch (error) {
    console.error('Error updating gallery:', error)
    return { gallery: null, error: 'Failed to update gallery' }
  }
}

// Delete gallery
export async function deleteGallery(id: string) {
  try {
    const [deletedGallery] = await db
      .delete(galleries)
      .where(eq(galleries.id, id))
      .returning()

    logAction('Gallery', `Deleted gallery: ${deletedGallery.title}`)
    revalidatePath('/admin/galleries')
    revalidatePath(`/g/${deletedGallery.slug}`)
    revalidatePath('/') // Revalidate home page to update navigation

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting gallery:', error)
    return { success: false, error: 'Failed to delete gallery' }
  }
}

// Add images to gallery
export async function addImagesToGallery(galleryId: string, images: { id: string; name: string; url: string; fileName: string }[]) {
  try {
    console.log('Adding images to gallery:', { galleryId, images })
    
    const galleryImageData = images.map((image, index) => {
      console.log('Processing image:', { id: image.id, idLength: image.id.length, fileName: image.fileName })
      
      // Ensure UUID is properly formatted and not too long
      const uuid = image.id.substring(0, 36) // Truncate to 36 chars if longer
      
      return {
        galleryId,
        uuid: uuid,
        fileName: image.fileName,
        fileUrl: image.url,
        name: image.name,
        order: index,
      }
    })

    console.log('Gallery image data to insert:', galleryImageData)

    const insertedImages = await db
      .insert(galleryImages)
      .values(galleryImageData)
      .returning()

    logAction('Gallery', `Added ${images.length} images to gallery`)
    
    // Get gallery slug for revalidation
    const gallery = await db
      .select({ slug: galleries.slug })
      .from(galleries)
      .where(eq(galleries.id, galleryId))
      .limit(1)
    
    if (gallery[0]) {
      revalidatePath(`/admin/galleries/${gallery[0].slug}`)
      revalidatePath(`/g/${gallery[0].slug}`)
    }
    revalidatePath('/admin/galleries')

    return { images: insertedImages, error: null }
  } catch (error) {
    console.error('Error adding images to gallery:', error)
    return { images: null, error: 'Failed to add images to gallery' }
  }
}

// Remove image from gallery
export async function removeImageFromGallery(imageId: string) {
  try {
    const [deletedImage] = await db
      .delete(galleryImages)
      .where(eq(galleryImages.id, imageId))
      .returning()

      // delete from r2 as well

    logAction('Gallery', `Removed image from gallery: ${deletedImage.name}`)
    
    // Get gallery slug for revalidation
    const gallery = await db
      .select({ slug: galleries.slug })
      .from(galleries)
      .where(eq(galleries.id, deletedImage.galleryId))
      .limit(1)
    
    if (gallery[0]) {
      revalidatePath(`/admin/galleries/${gallery[0].slug}`)
      revalidatePath(`/g/${gallery[0].slug}`)
    }
    revalidatePath('/admin/galleries')

    return { success: true, error: null }
  } catch (error) {
    console.error('Error removing image from gallery:', error)
    return { success: false, error: 'Failed to remove image from gallery' }
  }
}

// Update image order in gallery
export async function updateGalleryImageOrder(galleryId: string, imageOrders: { id: string; order: number }[]) {
  try {
    for (const { id, order } of imageOrders) {
      await db
        .update(galleryImages)
        .set({ order })
        .where(eq(galleryImages.id, id))
    }

    logAction('Gallery', `Updated image order in gallery`)
    
    // Get gallery slug for revalidation
    const gallery = await db
      .select({ slug: galleries.slug })
      .from(galleries)
      .where(eq(galleries.id, galleryId))
      .limit(1)
    
    if (gallery[0]) {
      revalidatePath(`/admin/galleries/${gallery[0].slug}`)
      revalidatePath(`/g/${gallery[0].slug}`)
    }
    revalidatePath('/admin/galleries')

    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating image order:', error)
    return { success: false, error: 'Failed to update image order' }
  }
}

// Increment view count
export async function incrementGalleryViews(galleryId: string) {
  try {
    // First get current view count
    const [currentGallery] = await db
      .select({ viewCount: galleries.viewCount })
      .from(galleries)
      .where(eq(galleries.id, galleryId))
      .limit(1)

    if (currentGallery) {
      await db
        .update(galleries)
        .set({
          viewCount: currentGallery.viewCount + 1,
        })
        .where(eq(galleries.id, galleryId))
    }
  } catch (error) {
    console.error('Error incrementing gallery views:', error)
    // Don't throw error as this is not critical
  }
}

// Generate shareable link for gallery
export async function generateShareableLink(galleryId: string) {
  try {
    const shareableLink = crypto.randomUUID()
    
    await db
      .update(galleries)
      .set({ shareableLink })
      .where(eq(galleries.id, galleryId))

    return { shareableLink, error: null }
  } catch (error) {
    console.error('Error generating shareable link:', error)
    return { shareableLink: null, error: 'Failed to generate shareable link' }
  }
}

// Get gallery by shareable link
export async function getGalleryByShareableLink(shareableLink: string) {
  try {
    const [gallery] = await db
      .select()
      .from(galleries)
      .where(eq(galleries.shareableLink, shareableLink))
      .limit(1)

    if (!gallery) {
      return null
    }

    const images = await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.galleryId, gallery.id))
      .orderBy(asc(galleryImages.order), asc(galleryImages.uploadedAt))

    return {
      ...gallery,
      images,
    }
  } catch (error) {
    console.error('Error fetching gallery by shareable link:', error)
    throw new Error('Failed to fetch gallery')
  }
}

// Bulk move images between galleries
export async function moveImagesBetweenGalleries(imageIds: string[], targetGalleryId: string) {
  try {
    // Get the highest order in target gallery
    const [maxOrderResult] = await db
      .select({ maxOrder: sql<number>`MAX(${galleryImages.order})` })
      .from(galleryImages)
      .where(eq(galleryImages.galleryId, targetGalleryId))

    const startOrder = (maxOrderResult?.maxOrder || 0) + 1

    // Move images to target gallery with new order
    for (let i = 0; i < imageIds.length; i++) {
      await db
        .update(galleryImages)
        .set({
          galleryId: targetGalleryId,
          order: startOrder + i
        })
        .where(eq(galleryImages.id, imageIds[i]))
    }

    logAction('Gallery', `Moved ${imageIds.length} images to gallery ${targetGalleryId}`)
    revalidatePath('/admin/galleries')

    return { success: true, error: null }
  } catch (error) {
    console.error('Error moving images between galleries:', error)
    return { success: false, error: 'Failed to move images' }
  }
}

// Bulk delete images from gallery
export async function bulkDeleteImages(imageIds: string[]) {
  try {
    // Note: This only removes from gallery, doesn't delete from storage
    // You might want to add storage cleanup if needed
    await db
      .delete(galleryImages)
      .where(sql`${galleryImages.id} = ANY(${imageIds})`)

    logAction('Gallery', `Bulk deleted ${imageIds.length} images from galleries`)
    revalidatePath('/admin/galleries')

    return { success: true, error: null }
  } catch (error) {
    console.error('Error bulk deleting images:', error)
    return { success: false, error: 'Failed to delete images' }
  }
}

// Get galleries by category
export async function getGalleriesByCategory(category: string, includePrivate = false) {
  try {
    const result = await db
      .select()
      .from(galleries)
      .where(sql`${galleries.category} = ${category} ${includePrivate ? sql`` : sql`AND ${galleries.isPublic} = true`}`)
      .orderBy(desc(galleries.createdAt))

    return result
  } catch (error) {
    console.error('Error fetching galleries by category:', error)
    throw new Error('Failed to fetch galleries')
  }
}

// Get galleries by tags
export async function getGalleriesByTags(tags: string[], includePrivate = false) {
  try {
    const tagConditions = tags.map(tag => sql`${galleries.tags} LIKE ${`%${tag}%`}`)
    const tagQuery = tagConditions.reduce((acc, condition) => 
      acc ? sql`${acc} OR ${condition}` : condition
    )

    const result = await db
      .select()
      .from(galleries)
      .where(sql`(${tagQuery}) ${includePrivate ? sql`` : sql`AND ${galleries.isPublic} = true`}`)
      .orderBy(desc(galleries.createdAt))

    return result
  } catch (error) {
    console.error('Error fetching galleries by tags:', error)
    throw new Error('Failed to fetch galleries')
  }
}

// Update image metadata and caption
export async function updateImageMetadata(imageId: string, data: {
  name?: string
  caption?: string
  tags?: string
  metadata?: Record<string, any>
  alt?: string
  description?: string
}) {
  try {
    await db
      .update(galleryImages)
      .set(data)
      .where(eq(galleryImages.id, imageId))

    logAction('Gallery', `Updated metadata for image ${imageId}`)
    revalidatePath('/admin/galleries')

    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating image metadata:', error)
    return { success: false, error: 'Failed to update image metadata' }
  }
}

// Get all galleries with preview images (for admin page)
export async function getGalleriesWithPreviews(includePrivate = false) {
  try {
    const galleriesData = await db
      .select()
      .from(galleries)
      .where(includePrivate ? undefined : eq(galleries.isPublic, true))
      .orderBy(desc(galleries.createdAt))

    const galleriesWithPreviews = await Promise.all(
      galleriesData.map(async (gallery) => {
        // Get image count
        const imageCount = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(galleryImages)
          .where(eq(galleryImages.galleryId, gallery.id))
        
        // Get first 5 images for preview
        const previewImages = await db
          .select({
            id: galleryImages.id,
            fileUrl: galleryImages.fileUrl,
            name: galleryImages.name,
            alt: galleryImages.alt,
          })
          .from(galleryImages)
          .where(eq(galleryImages.galleryId, gallery.id))
          .orderBy(asc(galleryImages.order), asc(galleryImages.uploadedAt))
          .limit(5)

        return {
          ...gallery,
          imageCount: imageCount[0].count,
          images: previewImages,
        }
      })
    )

    return galleriesWithPreviews
  } catch (error) {
    console.error('Error fetching galleries with previews:', error)
    throw new Error('Failed to fetch galleries with previews')
  }
}

// Get galleries that should be shown in navigation
export async function getNavigationGalleries() {
  try {
    const result = await db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
      })
      .from(galleries)
      .where(eq(galleries.showInNav, true))
      .orderBy(asc(galleries.title))

    return result
  } catch (error) {
    console.error('Error fetching navigation galleries:', error)
    return []
  }
}
