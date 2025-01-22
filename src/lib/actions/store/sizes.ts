'use server'

import { db } from '~/server/db'
import { basePrintSizes } from '~/server/db/schema'
import { revalidatePath } from 'next/cache'

export async function addPrintSize(data: {
  name: string
  width: number
  height: number
  basePrice: number
}) {
  try {
    const [size] = await db
      .insert(basePrintSizes)
      .values({
        name: data.name,
        width: data.width,
        height: data.height,
        basePrice: data.basePrice,
      })
      .returning()

    revalidatePath('/admin/store/sizes')
    return { success: true, data: size }
  } catch (error) {
    return { success: false, error: 'Failed to add size' }
  }
}