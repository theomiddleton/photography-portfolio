'use server'

import { db } from '~/server/db'
import { basePrintSizes } from '~/server/db/schema'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

export async function addPrintSize(data: {
  name: string
  width: number
  height: number
  basePrice: number
  sellAtPrice: number
  profitPercentage: number
}) {
  try {
    const [size] = await db
      .insert(basePrintSizes)
      .values({
        name: data.name,
        width: data.width,
        height: data.height,
        basePrice: data.basePrice,
        sellAtPrice: data.sellAtPrice,
        profitPercentage: data.profitPercentage,
      })
      .returning()

    revalidatePath('/admin/store/sizes')
    return { success: true, data: size }
  } catch (error) {
    return { success: false, error: 'Failed to add size' }
  }
}

export async function updatePrintSize(
  id: string,
  data: {
    name: string
    width: number
    height: number
    basePrice: number
    sellAtPrice: number
    profitPercentage: number
  },
) {
  try {
    const [size] = await db
      .update(basePrintSizes)
      .set({
        name: data.name,
        width: data.width,
        height: data.height,
        basePrice: data.basePrice,
        sellAtPrice: data.sellAtPrice,
        profitPercentage: data.profitPercentage,
        updatedAt: new Date(),
      })
      .where(eq(basePrintSizes.id, id))
      .returning()

    revalidatePath('/admin/store/sizes')
    return { success: true, data: size }
  } catch (error) {
    return { success: false, error: 'Failed to update size' }
  }
}