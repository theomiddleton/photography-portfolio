'use server'

import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { revalidatePath } from 'next/cache'
import { logAction } from '~/lib/logging'

/**
 * Export all image data as JSON
 */
export async function exportImageData() {
  try {
    const images = await db.select().from(imageData)
    return { success: true, data: images }
  } catch (error) {
    console.error('Error exporting image data:', error)
    return { success: false, error: 'Failed to export image data' }
  }
}

/**
 * Import image data from JSON
 */
export async function importImageData(data: any[]) {
  try {
    // Validate that the data is an array
    if (!Array.isArray(data)) {
      return { success: false, error: 'Invalid data format. Expected an array of image data.' }
    }

    // Validate each item in the array has the required fields
    for (const item of data) {
      if (!item.uuid || !item.fileName || !item.fileUrl || !item.name) {
        return { 
          success: false, 
          error: 'Invalid data format. Each item must have uuid, fileName, fileUrl, and name fields.' 
        }
      }
    }

    // Process the import
    const result = await db.transaction(async (tx) => {
      // Insert new data
      for (const item of data) {
        await tx.insert(imageData).values({
          uuid: item.uuid,
          fileName: item.fileName,
          fileUrl: item.fileUrl,
          name: item.name,
          description: item.description || '',
          tags: item.tags || '',
          visible: item.visible !== undefined ? item.visible : true,
          order: item.order || 0,
          uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : new Date(),
          modifiedAt: item.modifiedAt ? new Date(item.modifiedAt) : new Date(),
        })
      }
      
      return { success: true, count: data.length }
    })

    logAction('import', `Imported ${data.length} images`)
    revalidatePath('/admin/manage')
    
    return { 
      success: true, 
      message: `Successfully imported ${data.length} images`,
      result 
    }
  } catch (error) {
    console.error('Error importing image data:', error)
    return { success: false, error: 'Failed to import image data' }
  }
}