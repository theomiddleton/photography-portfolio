'use server'
import type { PortfolioImageData } from '~/lib/types/image'
import { getImages, updateImagesOrder } from '~/lib/actions/image'

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
