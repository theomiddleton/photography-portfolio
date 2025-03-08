'use server'

import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { revalidatePath } from 'next/cache'
import { imageData, aboutImgData, products, productSizes } from '~/server/db/schema'
import { logAction } from '~/lib/logging'

// type definitions
interface DeleteImageParams {
  uuid: string
  fileName: string
  keepStoreData?: boolean
}

export async function deleteImage({ uuid, fileName }: DeleteImageParams) {
  try {
    
    // delete from r2
    await r2.send(new DeleteObjectCommand({
      Bucket: process.env.R2_IMAGE_BUCKET_NAME,
      Key: fileName
    }))
    
    // Find any products using this image
    const productsToDelete = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.imageUrl, fileName))

    // Delete associated product sizes first (due to foreign key constraints)
    for (const product of productsToDelete) {
      await db.delete(productSizes)
        .where(eq(productSizes.productId, product.id))
    }

    // Delete the products
    await db.delete(products)
      .where(eq(products.imageUrl, fileName))
    
    // delete image data from database
    await db.delete(imageData).where(eq(imageData.uuid, uuid))
    await db.delete(aboutImgData).where(eq(aboutImgData.uuid, uuid))
    
    revalidatePath('/admin/mangage')
    revalidatePath('/admin/store')
    // log it with custom logging implementation, storing the log in the db
    // return either success message or error message
    logAction('Delete', `Image ${uuid} deleted successfully`)
    return { success: true, message: 'Image deleted successfully' }
  } catch (error) {
    console.error('Error deleting image:', error)
    logAction('Delete', error)
    return { success: false, message: 'Failed to delete image' }
  }
}