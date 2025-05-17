'use server'
import { ImageDataWithId, getImages } from '~/lib/actions/image'

export async function getInitialPortfolioImages(): Promise<ImageDataWithId[]> {
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

    // Ensure that 'images' is always an array, even if the underlying function might return undefined on error (though it seems to throw)
    return images || []
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
