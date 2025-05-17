import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { eq, desc, asc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schema for image data
export const imageSchema = z.object({
  id: z.number().optional(),
  uuid: z.string().uuid(),
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  name: z.string().min(1),
  description: z.string().optional(),
  tags: z.string().optional(),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
})

export type ImageDataWithId = z.infer<typeof imageSchema> & { id: number }

// Get all images with optional filtering and sorting
export async function getImages({
  visible,
  sortBy = 'order',
  sortDirection = 'asc',
  limit,
  offset = 0,
}: {
  visible?: boolean
  sortBy?: keyof typeof imageData.$inferSelect
  sortDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
} = {}) {
  try {
    // Build the base query with type safety
    const query = db.select().from(imageData).$dynamic() // Enable dynamic query building

    // Create a type-safe query builder
    const buildQuery = <T extends typeof query>(qb: T) => {
      // Apply visibility filter if provided
      if (visible !== undefined) {
        qb = qb.where(eq(imageData.visible, visible))
      }

      // Apply sorting with type checking
      const sortFn = sortDirection === 'desc' ? desc : asc
      qb = qb.orderBy(sortFn(imageData[sortBy]))

      // Apply pagination if limit is provided
      if (limit !== undefined) {
        qb = qb.limit(limit).offset(offset)
      }

      return qb
    }

    // Execute the query with all conditions
    const images = await buildQuery(query)

    return { images, error: null }
  } catch (error) {
    console.error('Error fetching images:', error)
    return { images: [], error: 'Failed to fetch images' }
  }
}

// Get a single image by ID
export async function getImageById(id: number) {
  try {
    const [image] = await db
      .select()
      .from(imageData)
      .where(eq(imageData.id, id))
      .limit(1)

    return { image, error: null }
  } catch (error) {
    console.error(`Error fetching image with ID ${id}:`, error)
    return { image: null, error: 'Failed to fetch image' }
  }
}

// Create a new image
export async function createImage(data: z.infer<typeof imageSchema>) {
  try {
    // Validate the input data
    const validatedData = imageSchema.parse(data)

    // Get the highest order value to place new image at the end
    const [maxOrderResult] = await db
      .select({ maxOrder: sql<number>`MAX(${imageData.order})` })
      .from(imageData)

    const maxOrder = maxOrderResult?.maxOrder || 0
    const newOrder = maxOrder + 1

    // Insert the new image with explicit field selection
    const [newImage] = await db
      .insert(imageData)
      .values({
        uuid: validatedData.uuid,
        fileName: validatedData.fileName,
        fileUrl: validatedData.fileUrl,
        name: validatedData.name,
        description: validatedData.description,
        tags: validatedData.tags,
        visible: validatedData.visible,
        order: newOrder,
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      })
      .returning()

    // Revalidate the images page to update the UI
    revalidatePath('/admin/manage')
    revalidatePath('/')

    return { image: newImage, error: null }
  } catch (error) {
    console.error('Error creating image:', error)
    if (error instanceof z.ZodError) {
      return { image: null, error: error.errors }
    }
    return { image: null, error: 'Failed to create image' }
  }
}

// Update an existing image
export async function updateImage(
  id: number,
  data: Partial<z.infer<typeof imageSchema>>,
) {
  try {
    // Validate the input data (partial validation)
    const validatedData = imageSchema.partial().parse(data)

    // Update the image
    const [updatedImage] = await db
      .update(imageData)
      .set({
        ...validatedData,
        modifiedAt: new Date(),
      })
      .where(eq(imageData.id, id))
      .returning()

    if (!updatedImage) {
      return { image: null, error: 'Image not found' }
    }

    // Revalidate the images page to update the UI
    revalidatePath('/admin/manage')
    revalidatePath('/')

    return { image: updatedImage, error: null }
  } catch (error) {
    console.error(`Error updating image with ID ${id}:`, error)
    if (error instanceof z.ZodError) {
      return { image: null, error: error.errors }
    }
    return { image: null, error: 'Failed to update image' }
  }
}

// Delete an image
export async function deleteImage(id: number) {
  try {
    const [deletedImage] = await db
      .delete(imageData)
      .where(eq(imageData.id, id))
      .returning()

    if (!deletedImage) {
      return { success: false, error: 'Image not found' }
    }

    // Revalidate the images page to update the UI
    revalidatePath('/admin/manage')
    revalidatePath('/')

    return { success: true, error: null }
  } catch (error) {
    console.error(`Error deleting image with ID ${id}:`, error)
    return { success: false, error: 'Failed to delete image' }
  }
}

// Update the order of multiple images
export async function updateImagesOrder(
  imageOrders: { id: number; order: number }[],
) {
  try {
    // Use a transaction to ensure all updates succeed or fail together
    const result = await db.transaction(async (tx) => {
      const updatedImages = []

      for (const { id, order } of imageOrders) {
        const [updatedImage] = await tx
          .update(imageData)
          .set({
            order,
            modifiedAt: new Date(),
          })
          .where(eq(imageData.id, id))
          .returning()

        if (updatedImage) {
          updatedImages.push(updatedImage)
        }
      }

      return updatedImages
    })

    // Revalidate the images page to update the UI
    revalidatePath('/admin/manage')
    revalidatePath('/')

    return { images: result, error: null }
  } catch (error) {
    console.error('Error updating image orders:', error)
    return { images: [], error: 'Failed to update image orders' }
  }
}

// Toggle image visibility
export async function toggleImageVisibility(id: number) {
  try {
    // Get the current visibility state
    const { image: currentImage } = await getImageById(id)

    if (!currentImage) {
      return { image: null, error: 'Image not found' }
    }

    // Toggle the visibility
    const [updatedImage] = await db
      .update(imageData)
      .set({
        visible: !currentImage.visible,
        modifiedAt: new Date(),
      })
      .where(eq(imageData.id, id))
      .returning()

    // Revalidate the images page to update the UI
    revalidatePath('/admin/manage')
    revalidatePath('/')

    return { image: updatedImage, error: null }
  } catch (error) {
    console.error(`Error toggling visibility for image with ID ${id}:`, error)
    return { image: null, error: 'Failed to toggle image visibility' }
  }
}

// Get total image count (for pagination)
export async function getImageCount(visibleOnly?: boolean) {
  try {
    const query = db
      .select({ count: sql<number>`count(${imageData.id})` })
      .from(imageData)
      .$dynamic()

    if (visibleOnly) {
      query.where(eq(imageData.visible, true))
    }

    const [result] = await query

    return { count: result?.count ?? 0, error: null }
  } catch (error) {
    console.error('Error counting images:', error)
    return { count: 0, error: 'Failed to count images' }
  }
}