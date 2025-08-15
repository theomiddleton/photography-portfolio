'use server'
import type { PortfolioImageData } from '~/lib/types/image'
import { getImages, updateImagesOrder } from '~/lib/actions/image'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { logAction } from '~/lib/logging'
import { waitUntil } from '@vercel/functions'

// Define SerializedImageData where Date fields are strings
type SerializedImageData = Omit<
  PortfolioImageData,
  'uploadedAt' | 'modifiedAt'
> & {
  uploadedAt: string
  modifiedAt: string
}

export async function getInitialPortfolioImages(): Promise<
  SerializedImageData[]
> {
  // Returns SerializedImageData
  'use server'
  try {
    console.log('Fetching initial portfolio images in server action...')
    // Fetch images, sorted by 'order' in ascending direction by default
    // You can customize these options if needed, e.g., { visible: true, sortBy: 'createdAt', sortDirection: 'desc' }
    const { images, error } = await getImages({
      sortBy: 'order',
      sortDirection: 'asc',
    })

    if (error) {
      console.error(
        'Error fetching initial portfolio images in server action:',
        error,
      )
      // Propagate a more generic error or the specific one, depending on desired client-side handling
      throw new Error('Failed to fetch initial portfolio images.')
    }

    if (!images) {
      return []
    }

    const mappedImages: SerializedImageData[] = images.map((dbImage) => {
      // dbImage.uploadedAt and dbImage.modifiedAt might be Date objects or null from the database.
      const uploadedAtDate = dbImage.uploadedAt
        ? new Date(dbImage.uploadedAt)
        : null
      const modifiedAtDate = dbImage.modifiedAt
        ? new Date(dbImage.modifiedAt)
        : null

      // Ensure all required fields have a value, falling back to defaults if undefined/null.
      return {
        id: dbImage.id ?? 0,
        uuid: dbImage.uuid ?? '',
        fileName: dbImage.fileName ?? '',
        fileUrl: dbImage.fileUrl ?? '',
        name: dbImage.name ?? '',
        description: dbImage.description ?? undefined,
        tags: dbImage.tags ?? undefined,
        visible: dbImage.visible ?? false,
        order: dbImage.order ?? 0,
        // Convert Date objects (or null) to ISO strings. Use epoch if null.
        uploadedAt: uploadedAtDate
          ? uploadedAtDate.toISOString()
          : new Date(0).toISOString(),
        modifiedAt: modifiedAtDate
          ? modifiedAtDate.toISOString()
          : new Date(0).toISOString(),
      }
    })
    return mappedImages
  } catch (err) {
    console.error('Exception in getInitialPortfolioImages server action:', err)
    // Re-throw the error so the client component can catch it and display an error state
    if (err instanceof Error) {
      throw new Error(`Server action failed: ${err.message}`)
    }
    throw new Error(
      'An unknown error occurred in the server action while fetching initial images.',
    )
  }
}

export async function savePortfolioImagesOrder(
  imagesToUpdate: { id: number; order: number }[],
): Promise<{ success: boolean; error?: string | unknown }> {
  'use server'
  try {
    console.log('Updating portfolio images order in server action...')
    const { error } = await updateImagesOrder(imagesToUpdate)

    if (error) {
      console.error(
        'Error updating portfolio images order in server action:',
        error,
      )
      return { success: false, error: 'Failed to update images order.' }
    }

    return { success: true }
  } catch (err) {
    console.error('Exception in savePortfolioImagesOrder server action:', err)
    const errorMessage =
      err instanceof Error ? err.message : 'An unknown server error occurred.'
    return { success: false, error: errorMessage }
  }
}

/**
 * Check for images missing EXIF data
 * An image is considered missing EXIF data if all key EXIF fields are null/empty
 */
export async function getImagesWithoutExif(): Promise<{
  count: number
  images: { uuid: string; fileUrl: string; name: string }[]
  error?: string
}> {
  'use server'
  try {
    // Query for images where essential EXIF fields are null
    // We check multiple key fields to determine if EXIF data is truly missing
    const allImages = await db
      .select({
        uuid: imageData.uuid,
        fileUrl: imageData.fileUrl,
        name: imageData.name,
        cameraMake: imageData.cameraMake,
        cameraModel: imageData.cameraModel,
        iso: imageData.iso,
        aperture: imageData.aperture,
        shutterSpeed: imageData.shutterSpeed,
        rawExifData: imageData.rawExifData,
      })
      .from(imageData)

    // Filter results to only include images that have ALL essential fields missing
    const imagesWithoutExif = allImages.filter((image) => {
      // An image is considered to lack EXIF data if:
      // 1. No camera information AND
      // 2. No technical settings AND  
      // 3. No raw EXIF data OR empty raw EXIF data
      const noCameraInfo = !image.cameraMake && !image.cameraModel
      const noTechnicalData = !image.iso && !image.aperture && !image.shutterSpeed
      const noRawExifData = !image.rawExifData || 
                           (typeof image.rawExifData === 'object' && Object.keys(image.rawExifData).length === 0)
      
      return noCameraInfo && noTechnicalData && noRawExifData
    })

    const resultImages = imagesWithoutExif.map(img => ({
      uuid: img.uuid,
      fileUrl: img.fileUrl,
      name: img.name,
    }))

    waitUntil(
      logAction(
        'exif-check',
        `Found ${resultImages.length} images without EXIF data out of ${allImages.length} total images`
      )
    )

    return {
      count: resultImages.length,
      images: resultImages,
    }
  } catch (error) {
    console.error('Error checking for images without EXIF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    waitUntil(
      logAction(
        'exif-check',
        `Error checking images without EXIF: ${errorMessage}`
      )
    )

    return {
      count: 0,
      images: [],
      error: errorMessage,
    }
  }
}

/**
 * Migrate EXIF data for a batch of images
 */
export async function migrateExifDataBatch(imageIds: string[]): Promise<{
  success: boolean
  processed: number
  failed: number
  errors: string[]
}> {
  'use server'
  try {
    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
    }

    waitUntil(
      logAction(
        'exif-migration',
        `Starting EXIF migration for ${imageIds.length} images`
      )
    )

    // Process images sequentially to avoid overwhelming the system
    for (const imageId of imageIds) {
      try {
        // Get the image data from database
        const image = await db
          .select({
            uuid: imageData.uuid,
            fileUrl: imageData.fileUrl,
            name: imageData.name,
          })
          .from(imageData)
          .where(eq(imageData.uuid, imageId))
          .limit(1)

        if (!image.length) {
          results.errors.push(`Image ${imageId} not found in database`)
          results.failed++
          continue
        }

        const imageRecord = image[0]

        try {
          // Fetch the image from the URL and extract EXIF data directly
          const imageResponse = await fetch(imageRecord.fileUrl)
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
          }

          const imageBuffer = await imageResponse.arrayBuffer()

          // Import the EXIF functions here to avoid circular imports
          const { extractExifData, validateExifData } = await import('~/lib/exif')

          // Extract EXIF data
          const exifData = await extractExifData(imageBuffer)

          // Validate the extracted data
          const validatedExifData = validateExifData(exifData)

          // Update the database record with EXIF data
          const updateResult = await db
            .update(imageData)
            .set(validatedExifData)
            .where(eq(imageData.uuid, imageId))
            .returning({ id: imageData.id, uuid: imageData.uuid })

          if (updateResult.length === 0) {
            results.errors.push(`Failed to update database for image: ${imageRecord.name}`)
            results.failed++
          } else {
            results.processed++
            waitUntil(
              logAction(
                'exif-migration',
                `Successfully processed EXIF for image: ${imageRecord.name} (${imageId})`
              )
            )
          }
        } catch (exifError) {
          const errorMessage = exifError instanceof Error ? exifError.message : 'Unknown EXIF error'
          results.errors.push(`Failed to process EXIF for ${imageRecord.name}: ${errorMessage}`)
          results.failed++
          waitUntil(
            logAction(
              'exif-migration',
              `EXIF processing error for ${imageRecord.name}: ${errorMessage}`
            )
          )
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`Error processing image ${imageId}: ${errorMessage}`)
        results.failed++
      }
    }

    waitUntil(
      logAction(
        'exif-migration',
        `EXIF migration completed: ${results.processed} processed, ${results.failed} failed`
      )
    )

    return {
      success: results.failed === 0,
      ...results,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    waitUntil(
      logAction(
        'exif-migration',
        `Error in EXIF migration batch: ${errorMessage}`
      )
    )

    return {
      success: false,
      processed: 0,
      failed: imageIds.length,
      errors: [errorMessage],
    }
  }
}
