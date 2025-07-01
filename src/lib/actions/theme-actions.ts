'use server'

import { revalidatePath } from 'next/cache'
import {
  getActiveTheme,
  getAllThemes,
  setActiveTheme,
  createCustomTheme,
  deleteTheme,
  validateThemeCSS,
  getThemeById,
} from '~/lib/theme/theme-service'
import { sanitizeCSS } from '~/lib/theme/css-parser'
import type { SiteTheme } from '~/server/db/schema'

export async function getThemesAction(): Promise<SiteTheme[]> {
  return await getAllThemes()
}

export async function getActiveThemeAction(): Promise<SiteTheme | null> {
  return await getActiveTheme()
}

export async function setActiveThemeAction(themeId: number): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await setActiveTheme(themeId)
    revalidatePath('/admin/themes')
    revalidatePath('/', 'layout') // Revalidate entire app layout
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to set active theme',
    }
  }
}

export async function createCustomThemeAction(
  name: string,
  cssVariables: string,
  activate = false,
): Promise<{
  success: boolean
  theme?: SiteTheme
  error?: string
}> {
  try {
    // Sanitize CSS input
    const { sanitized, warnings } = sanitizeCSS(cssVariables)

    if (warnings.length > 0) {
      return {
        success: false,
        error: `CSS validation warnings: ${warnings.join(', ')}`,
      }
    }

    const theme = await createCustomTheme(name, sanitized, activate)

    revalidatePath('/admin/themes')
    if (activate) {
      revalidatePath('/', 'layout') // Revalidate entire app layout
    }

    return { success: true, theme }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create theme',
    }
  }
}

export async function deleteThemeAction(themeId: number): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await deleteTheme(themeId)
    revalidatePath('/admin/themes')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete theme',
    }
  }
}

export async function validateThemeAction(cssVariables: string): Promise<{
  isValid: boolean
  errors: string[]
  variables: Record<string, string>
}> {
  return validateThemeCSS(cssVariables)
}

export async function previewThemeAction(themeId: number): Promise<{
  success: boolean
  theme?: SiteTheme
  error?: string
}> {
  try {
    const theme = await getThemeById(themeId)
    if (!theme) {
      return { success: false, error: 'Theme not found' }
    }
    return { success: true, theme }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to preview theme',
    }
  }
}
