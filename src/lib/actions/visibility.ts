'use server'

import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { logAction } from '~/lib/logging'

interface ChangeVisibilityParams {
  uuid: string
  visible: boolean
}

export async function changeVisibility({ uuid, visible }: ChangeVisibilityParams) {
  try {
    await db.update(imageData)
      .set({ visible })
      .where(eq(imageData.uuid, uuid))

    logAction('ChangeVisibility', `Image ${uuid} visibility changed to ${visible}`)
    return { success: true, message: 'Image visibility changed successfully' }
  } catch (error) {
    console.error('Error changing image visibility:', error)
    logAction('ChangeVisibility', error)
    return { success: false, message: 'Failed to change image visibility' }
  }
}