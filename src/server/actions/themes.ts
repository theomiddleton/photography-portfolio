'use server'

import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { themes } from '~/server/db/schema'
import type { Theme } from '~/server/db/schema'

export async function getThemes(): Promise<Theme[]> {
  try {
    return await db.select().from(themes).orderBy(desc(themes.isBuiltIn), themes.name)
  } catch (error) {
    console.error('Error fetching themes:', error)
    return []
  }
}

export async function getActiveTheme(): Promise<Theme | null> {
  try {
    const activeThemes = await db.select().from(themes).where(eq(themes.isActive, true)).limit(1)
    return activeThemes[0] || null
  } catch (error) {
    console.error('Error fetching active theme:', error)
    return null
  }
}

export async function createTheme(data: {
  name: string
  slug: string
  description?: string
  cssContent: string
  previewColors?: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
}): Promise<{ success: boolean; error?: string; theme?: Theme }> {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if slug already exists
    const existingTheme = await db.select().from(themes).where(eq(themes.slug, data.slug)).limit(1)
    if (existingTheme.length > 0) {
      return { success: false, error: 'Theme with this slug already exists' }
    }

    const [theme] = await db.insert(themes).values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      cssContent: data.cssContent,
      previewColors: data.previewColors,
      isBuiltIn: false,
      isActive: false,
      createdBy: session.id,
    }).returning()

    revalidatePath('/admin/themes')
    return { success: true, theme }
  } catch (error) {
    console.error('Error creating theme:', error)
    return { success: false, error: 'Failed to create theme' }
  }
}

export async function activateTheme(themeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Deactivate all themes first
    await db.update(themes).set({ isActive: false })

    // Activate the selected theme
    await db.update(themes).set({ isActive: true }).where(eq(themes.id, themeId))

    revalidatePath('/admin/themes')
    return { success: true }
  } catch (error) {
    console.error('Error activating theme:', error)
    return { success: false, error: 'Failed to activate theme' }
  }
}

export async function deleteTheme(themeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Don't allow deleting built-in themes
    const theme = await db.select().from(themes).where(eq(themes.id, themeId)).limit(1)
    if (theme.length === 0) {
      return { success: false, error: 'Theme not found' }
    }

    if (theme[0].isBuiltIn) {
      return { success: false, error: 'Cannot delete built-in theme' }
    }

    await db.delete(themes).where(eq(themes.id, themeId))

    revalidatePath('/admin/themes')
    return { success: true }
  } catch (error) {
    console.error('Error deleting theme:', error)
    return { success: false, error: 'Failed to delete theme' }
  }
}

export async function updateTheme(themeId: string, data: {
  name?: string
  description?: string
  cssContent?: string
  previewColors?: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const updateData: any = { ...data, updatedAt: new Date() }
    await db.update(themes).set(updateData).where(eq(themes.id, themeId))

    revalidatePath('/admin/themes')
    return { success: true }
  } catch (error) {
    console.error('Error updating theme:', error)
    return { success: false, error: 'Failed to update theme' }
  }
}