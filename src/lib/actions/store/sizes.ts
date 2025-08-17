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

export async function applyPrintSizeTemplate(
  templateSizes: Array<{
    name: string
    width: number
    height: number
    basePrice: number
  }>,
  conflictResolutions: Record<string, { action: 'overwrite' | 'skip' | 'both', existingId?: string }>
) {
  try {
    const results = {
      added: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    }

    for (const templateSize of templateSizes) {
      try {
        // Check if there's a conflict resolution for this size
        const conflictKey = Object.keys(conflictResolutions).find(key => {
          const resolution = conflictResolutions[key]
          return resolution?.existingId // This would be matched differently in real implementation
        })

        const resolution = conflictKey ? conflictResolutions[conflictKey] : null

        if (resolution) {
          switch (resolution.action) {
            case 'overwrite':
              if (resolution.existingId) {
                await db
                  .update(basePrintSizes)
                  .set({
                    name: templateSize.name,
                    width: templateSize.width,
                    height: templateSize.height,
                    basePrice: templateSize.basePrice,
                    updatedAt: new Date(),
                  })
                  .where(eq(basePrintSizes.id, resolution.existingId))
                results.updated++
              }
              break

            case 'both':
              // Add with modified name
              await db
                .insert(basePrintSizes)
                .values({
                  name: `${templateSize.name} (New)`,
                  width: templateSize.width,
                  height: templateSize.height,
                  basePrice: templateSize.basePrice,
                  sellAtPrice: null,
                })
              results.added++
              break

            case 'skip':
              results.skipped++
              break
          }
        } else {
          // No conflict, add normally
          await db
            .insert(basePrintSizes)
            .values({
              name: templateSize.name,
              width: templateSize.width,
              height: templateSize.height,
              basePrice: templateSize.basePrice,
              sellAtPrice: null,
            })
          results.added++
        }
      } catch (error) {
        results.errors.push(`Failed to process ${templateSize.name}: ${error}`)
      }
    }

    revalidatePath('/admin/store/costs')
    return { success: true, data: results }
  } catch (error) {
    console.error('Failed to apply template:', error)
    return { success: false, error: 'Failed to apply print size template' }
  }
}