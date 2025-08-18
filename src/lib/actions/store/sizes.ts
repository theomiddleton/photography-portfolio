'use server'

import { db } from '~/server/db'
import { basePrintSizes, productSizes } from '~/server/db/schema'
import { revalidatePath } from 'next/cache'
import { eq, and, or, inArray } from 'drizzle-orm'

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

    revalidatePath('/admin/store/costs')
    revalidatePath('/admin/store')
    revalidatePath('/admin/store/products')
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

    revalidatePath('/admin/store/costs')
    revalidatePath('/admin/store')
    revalidatePath('/admin/store/products')
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
  conflictResolutions: Record<
    string,
    { action: 'overwrite' | 'skip' | 'both'; existingId?: string }
  >,
) {
  try {
    const results = {
      added: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    }

    for (const templateSize of templateSizes) {
      try {
        // Derive a deterministic key expected from the UI layer:
        // e.g. "NAME:WIDTHxHEIGHT"
        const conflictKey = `${templateSize.name}:${templateSize.width}x${templateSize.height}`
        const resolution = conflictResolutions[conflictKey] ?? null

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
              await db.insert(basePrintSizes).values({
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
          await db.insert(basePrintSizes).values({
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
    revalidatePath('/admin/store')
    revalidatePath('/admin/store/products')
    return { success: true, data: results }
  } catch (error) {
    console.error('Failed to apply template:', error)
    return { success: false, error: 'Failed to apply print size template' }
  }
}

export async function applyPrintSizesToProducts(
  baseSizeIds: string[],
  productIds: string[],
  conflictResolutions: Record<
    string,
    { action: 'overwrite' | 'skip' | 'both'; existingId?: string }
  >,
) {
  try {
    const results = {
      productsUpdated: 0,
      sizesAdded: 0,
      sizesUpdated: 0,
      sizesSkipped: 0,
      errors: [] as string[],
    }

    // Get the base sizes to apply
    const baseSizes = await db
      .select()
      .from(basePrintSizes)
      .where(inArray(basePrintSizes.id, baseSizeIds))

    if (baseSizes.length === 0) {
      return { success: false, error: 'No valid base sizes found' }
    }

    for (const productId of productIds) {
      try {
        let productSizesAdded = 0

        for (const baseSize of baseSizes) {
          const conflictKey = `${productId}-${baseSize.name}`
          const resolution = conflictResolutions[conflictKey]

          // Check if this product already has a size with the same name or dimensions
          const existingSize = await db
            .select()
            .from(productSizes)
            .where(
              and(
                eq(productSizes.productId, productId),
                or(
                  eq(productSizes.name, baseSize.name),
                  and(
                    eq(productSizes.width, baseSize.width),
                    eq(productSizes.height, baseSize.height),
                  ),
                ),
              ),
            )
            .limit(1)

          if (existingSize.length > 0) {
            if (resolution) {
              switch (resolution.action) {
                case 'overwrite':
                  await db
                    .update(productSizes)
                    .set({
                      name: baseSize.name,
                      width: baseSize.width,
                      height: baseSize.height,
                      basePrice: baseSize.basePrice,
                      updatedAt: new Date(),
                    })
                    .where(eq(productSizes.id, existingSize[0].id))
                  results.sizesUpdated++
                  break

                case 'both':
                  // Create new size with modified name
                  await db.insert(productSizes).values({
                    productId,
                    name: `${baseSize.name} (Alt)`,
                    width: baseSize.width,
                    height: baseSize.height,
                    basePrice: baseSize.basePrice,
                    stripeProductId: `temp_${Date.now()}_${Math.random()}`,
                    stripePriceId: `temp_${Date.now()}_${Math.random()}`,
                  })
                  results.sizesAdded++
                  productSizesAdded++
                  break

                case 'skip':
                  results.sizesSkipped++
                  break
              }
            } else {
              results.sizesSkipped++
            }
          } else {
            // No conflict, add new size
            await db.insert(productSizes).values({
              productId,
              name: baseSize.name,
              width: baseSize.width,
              height: baseSize.height,
              basePrice: baseSize.basePrice,
              stripeProductId: `temp_${Date.now()}_${Math.random()}`,
              stripePriceId: `temp_${Date.now()}_${Math.random()}`,
            })
            results.sizesAdded++
            productSizesAdded++
          }
        }

        if (productSizesAdded > 0) {
          results.productsUpdated++
        }
      } catch (error) {
        results.errors.push(`Failed to process product ${productId}: ${error}`)
      }
    }

    revalidatePath('/admin/store/products')
    revalidatePath('/admin/store/costs')
    return { success: true, data: results }
  } catch (error) {
    console.error('Failed to apply sizes to products:', error)
    return { success: false, error: 'Failed to apply sizes to products' }
  }
}
