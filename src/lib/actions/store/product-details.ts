'use server'

import { db } from '~/server/db'
import { storeProductDetails } from '~/server/db/schema'
import { revalidatePath } from 'next/cache'
import { eq, desc, and, isNull } from 'drizzle-orm'

export async function addStoreProductDetail(data: {
  productId?: string
  label: string
  value: string
  isGlobal: boolean
  active: boolean
}) {
  try {
    // Get max order for the scope (global or product-specific)
    const whereClause = data.isGlobal 
      ? eq(storeProductDetails.isGlobal, true)
      : and(
          eq(storeProductDetails.isGlobal, false),
          data.productId ? eq(storeProductDetails.productId, data.productId) : isNull(storeProductDetails.productId)
        )

    const maxOrder = await db
      .select({ order: storeProductDetails.order })
      .from(storeProductDetails)
      .where(whereClause)
      .orderBy(desc(storeProductDetails.order))
      .limit(1)

    const nextOrder = maxOrder.length > 0 ? maxOrder[0].order + 1 : 0

    const [detail] = await db
      .insert(storeProductDetails)
      .values({
        productId: data.isGlobal ? null : data.productId || null,
        label: data.label,
        value: data.value,
        order: nextOrder,
        isGlobal: data.isGlobal,
        active: data.active,
      })
      .returning()

    revalidatePath('/admin/store')
    return { success: true, data: detail }
  } catch (error) {
    console.error('Failed to add store product detail:', error)
    return { success: false, error: 'Failed to add product detail' }
  }
}

export async function updateStoreProductDetail(
  id: string,
  data: {
    label?: string
    value?: string
    order?: number
    active?: boolean
  }
) {
  try {
    const [detail] = await db
      .update(storeProductDetails)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(storeProductDetails.id, id))
      .returning()

    revalidatePath('/admin/store')
    return { success: true, data: detail }
  } catch (error) {
    console.error('Failed to update store product detail:', error)
    return { success: false, error: 'Failed to update product detail' }
  }
}

export async function deleteStoreProductDetail(id: string) {
  try {
    await db.delete(storeProductDetails).where(eq(storeProductDetails.id, id))

    revalidatePath('/admin/store')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete store product detail:', error)
    return { success: false, error: 'Failed to delete product detail' }
  }
}

export async function reorderStoreProductDetails(detailIds: string[], isGlobal: boolean, productId?: string) {
  try {
    // Update order for each detail within the same scope
    for (let i = 0; i < detailIds.length; i++) {
      await db
        .update(storeProductDetails)
        .set({ order: i, updatedAt: new Date() })
        .where(eq(storeProductDetails.id, detailIds[i]))
    }

    revalidatePath('/admin/store')
    return { success: true }
  } catch (error) {
    console.error('Failed to reorder store product details:', error)
    return { success: false, error: 'Failed to reorder product details' }
  }
}

export async function getStoreProductDetails(productId?: string) {
  try {
    let details
    
    if (productId) {
      // Get global details + product-specific details
      details = await db
        .select()
        .from(storeProductDetails)
        .where(
          eq(storeProductDetails.isGlobal, true)
        )
        .orderBy(storeProductDetails.order)

      const productSpecific = await db
        .select()
        .from(storeProductDetails)
        .where(
          and(
            eq(storeProductDetails.isGlobal, false),
            eq(storeProductDetails.productId, productId)
          )
        )
        .orderBy(storeProductDetails.order)

      details = [...details, ...productSpecific]
    } else {
      // Get all details
      details = await db
        .select()
        .from(storeProductDetails)
        .orderBy(storeProductDetails.isGlobal, storeProductDetails.order)
    }

    return { success: true, data: details }
  } catch (error) {
    console.error('Failed to fetch store product details:', error)
    return { success: false, error: 'Failed to fetch product details' }
  }
}

export async function bulkApplyGlobalDetails(productId: string) {
  try {
    // Get all active global details
    const globalDetails = await db
      .select()
      .from(storeProductDetails)
      .where(
        and(
          eq(storeProductDetails.isGlobal, true),
          eq(storeProductDetails.active, true)
        )
      )

    // Create product-specific copies
    const productDetails = globalDetails.map(detail => ({
      productId,
      label: detail.label,
      value: detail.value,
      order: detail.order,
      isGlobal: false,
      active: true,
    }))

    if (productDetails.length > 0) {
      await db.insert(storeProductDetails).values(productDetails)
    }

    revalidatePath('/admin/store')
    return { success: true, count: productDetails.length }
  } catch (error) {
    console.error('Failed to bulk apply global details:', error)
    return { success: false, error: 'Failed to apply global details' }
  }
}