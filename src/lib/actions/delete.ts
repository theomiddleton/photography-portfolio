'use server'

import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { imageData, blogImgData, aboutImgData, storeImages, storeOrders } from '~/server/db/schema'
import { logAction } from '~/lib/logging'


interface DeleteImageParams {
  uuid: string
  fileName: string
  keepStoreData?: boolean
}

export async function deleteImage({ uuid, fileName, keepStoreData = false }: DeleteImageParams) {
  try {
    
    await r2.send(new DeleteObjectCommand({
      Bucket: process.env.R2_IMAGE_BUCKET_NAME,
      Key: fileName
    }))

    await db.delete(imageData).where(eq(imageData.uuid, uuid))
    await db.delete(blogImgData).where(eq(blogImgData.uuid, uuid))
    await db.delete(aboutImgData).where(eq(aboutImgData.uuid, uuid))

    if (!keepStoreData) {
      const storeImage = await db.select().from(storeImages).where(eq(storeImages.imageUuid, uuid)).limit(1)
      
      if (storeImage.length > 0) {
        const storeImageId = storeImage[0].id
        await db.delete(storeOrders).where(eq(storeOrders.storeImageId, storeImageId))
        await db.delete(storeImages).where(eq(storeImages.id, storeImageId))
      }
    }

    logAction('Delete', `Image ${uuid} deleted successfully`)
    return { success: true, message: 'Image deleted successfully' }
  } catch (error) {
    console.error('Error deleting image:', error)
    logAction('Delete', error)
    return { success: false, message: 'Failed to delete image' }
  }
}