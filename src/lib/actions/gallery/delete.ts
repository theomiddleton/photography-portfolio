import { DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'

const BUCKET_NAME = process.env.R2_CUSTOM_IMG_BUCKET_NAME!

// Extract file key from URL
function getFileKeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove leading slash and decode URI component
    return decodeURIComponent(urlObj.pathname.substring(1))
  } catch (error) {
    console.error('Error parsing file URL:', error)
    // Fallback: assume the URL is already a key
    return url.startsWith('/') ? url.substring(1) : url
  }
}

// Delete single file from R2
export async function deleteFileFromStorage(fileUrl: string): Promise<boolean> {
  try {
    const fileKey = getFileKeyFromUrl(fileUrl)
    
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    })

    await r2.send(command)
    console.log(`Successfully deleted file: ${fileKey}`)
    return true
  } catch (error) {
    console.error('Error deleting file from storage:', error)
    return false
  }
}

// Delete multiple files from R2
export async function deleteFilesFromStorage(fileUrls: string[]): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = []
  const failed: string[] = []

  if (fileUrls.length === 0) {
    return { success, failed }
  }

  try {
    // Convert URLs to keys
    const objects = fileUrls.map(url => ({
      Key: getFileKeyFromUrl(url)
    }))

    // S3 DeleteObjects can handle up to 1000 objects at once
    const batchSize = 1000
    
    for (let i = 0; i < objects.length; i += batchSize) {
      const batch = objects.slice(i, i + batchSize)
      
      try {
        const command = new DeleteObjectsCommand({
          Bucket: BUCKET_NAME,
          Delete: {
            Objects: batch,
            Quiet: false, // Set to false to get detailed response
          },
        })

        const response = await r2.send(command)
        
        // Track successful deletions
        if (response.Deleted) {
          response.Deleted.forEach(deleted => {
            if (deleted.Key) {
              success.push(deleted.Key)
            }
          })
        }

        // Track failed deletions
        if (response.Errors) {
          response.Errors.forEach(error => {
            if (error.Key) {
              failed.push(error.Key)
              console.error(`Failed to delete ${error.Key}: ${error.Message}`)
            }
          })
        }
      } catch (batchError) {
        console.error('Error deleting batch:', batchError)
        // Add all keys in this batch to failed list
        batch.forEach(obj => failed.push(obj.Key))
      }
    }

    console.log(`Storage cleanup completed. Success: ${success.length}, Failed: ${failed.length}`)
    return { success, failed }
  } catch (error) {
    console.error('Error in bulk delete operation:', error)
    // Mark all as failed
    fileUrls.forEach(url => failed.push(getFileKeyFromUrl(url)))
    return { success, failed }
  }
}