'use server'

import { db, dbWithTx } from '~/server/db'
import { storeBadges } from '~/server/db/schema'
import { revalidatePath } from 'next/cache'
import { eq, desc } from 'drizzle-orm'

export async function addStoreBadge(data: {
  name: string
  icon: string
  text: string
  active: boolean
}) {
  try {
    // Check if badge with same name exists
    const existing = await db
      .select({ id: storeBadges.id })
      .from(storeBadges)
      .where(eq(storeBadges.name, data.name))
      .limit(1)
    if (existing.length > 0) {
      return { success: false, error: 'A badge with this name already exists' }
    }
    const maxOrder = await db
      .select({ order: storeBadges.order })
      .from(storeBadges)
      .orderBy(desc(storeBadges.order))
      .limit(1)
    const nextOrder = maxOrder.length > 0 ? maxOrder[0].order + 1 : 0
    const [badge] = await db
      .insert(storeBadges)
      .values({
        name: data.name,
        icon: data.icon,
        text: data.text,
        order: nextOrder,
        active: data.active,
        isDefault: false,
      })
      .returning()
    revalidatePath('/admin/store')
    return { success: true, data: badge }
  } catch (error) {
    console.error('Failed to add store badge:', error)
    return { success: false, error: 'Failed to add badge' }
  }
}

export async function updateStoreBadge(
  id: string,
  data: {
    name?: string
    icon?: string
    text?: string
    order?: number
    active?: boolean
  }
) {
  try {
    const [badge] = await db
      .update(storeBadges)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(storeBadges.id, id))
      .returning()

    revalidatePath('/admin/store')
    return { success: true, data: badge }
  } catch (error) {
    console.error('Failed to update store badge:', error)
    return { success: false, error: 'Failed to update badge' }
  }
}

export async function deleteStoreBadge(id: string) {
  try {
    await db.delete(storeBadges).where(eq(storeBadges.id, id))

    revalidatePath('/admin/store')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete store badge:', error)
    return { success: false, error: 'Failed to delete badge' }
  }
}

export async function reorderStoreBadges(badgeIds: string[]) {
  try {
    // Batch update using a transaction for better performance
    await dbWithTx.transaction(async (tx) => {
      const updates = badgeIds.map((id, index) =>
        tx
          .update(storeBadges)
          .set({ order: index, updatedAt: new Date() })
          .where(eq(storeBadges.id, id))
      )
      await Promise.all(updates)
    })
    revalidatePath('/admin/store')
    return { success: true }
  } catch (error) {
    console.error('Failed to reorder store badges:', error)
    return { success: false, error: 'Failed to reorder badges' }
  }
}

export async function getStoreBadges() {
  try {
    const badges = await db
      .select()
      .from(storeBadges)
      .orderBy(storeBadges.order)

    return { success: true, data: badges }
  } catch (error) {
    console.error('Failed to fetch store badges:', error)
    return { success: false, error: 'Failed to fetch badges' }
  }
}