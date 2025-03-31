'use server'

import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { logAction } from '~/lib/logging'

export type UpdateImageOrderInput = {
  id: number
  order: number
}[]

export async function updateImageOrder(newOrder: UpdateImageOrderInput) {
  try {
    // Update each image's order individually
    for (const item of newOrder) {
      await db
        .update(imageData)
        .set({ order: item.order })
        .where(eq(imageData.id, item.id))
    }
    
    logAction('Update image order', 'Image order updated successfully')

    // Revalidate the page to reflect the new order
    revalidatePath('/admin/delete')

    return { success: true, message: 'Image order updated successfully' }
  } catch (error) {
    console.error('Failed to update image order:', error)
    logAction('Update image order', `failed to update image order ${error}`)
    return { success: false, message: 'Failed to update image order' }
  }
}