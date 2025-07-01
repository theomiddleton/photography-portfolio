import { db, dbWithTx } from '~/server/db'
import { siteThemes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { parseCSS } from './css-parser'
import type { SiteTheme } from '~/server/db/schema'

/**
 * Get the currently active theme
 */
export const getActiveTheme = cache(async (): Promise<SiteTheme | null> => {
  const activeTheme = await db
    .select()
    .from(siteThemes)
    .where(eq(siteThemes.isActive, true))
    .limit(1)

  return activeTheme[0] || null
})

/**
 * Get all available themes
 */
export const getAllThemes = cache(async (): Promise<SiteTheme[]> => {
  return await db.select().from(siteThemes).orderBy(siteThemes.createdAt)
})

/**
 * Set a theme as active (deactivates all others)
 */
export async function setActiveTheme(themeId: number): Promise<void> {
  await dbWithTx.transaction(async (tx) => {
    // Deactivate all themes
    await tx.update(siteThemes).set({ isActive: false, updatedAt: new Date() })

    // Activate the selected theme
    await tx
      .update(siteThemes)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(siteThemes.id, themeId))
  })
}

/**
 * Create a new custom theme
 */
export async function createCustomTheme(
  name: string,
  cssVariables: string,
  activate = false,
): Promise<SiteTheme> {
  // Validate CSS before creating
  const validationResult = validateThemeCSS(cssVariables)
  if (!validationResult.isValid) {
    throw new Error(`Invalid CSS: ${validationResult.errors.join(', ')}`)
  }

  let newTheme: SiteTheme

  if (activate) {
    await dbWithTx.transaction(async (tx) => {
      // Create the new theme
      const inserted = await tx
        .insert(siteThemes)
        .values({
          name,
          cssVariables,
          isCustom: true,
          isActive: true,
        })
        .returning()

      newTheme = inserted[0]!

      // Deactivate all other themes
      await tx
        .update(siteThemes)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(siteThemes.id, newTheme.id))
    })
  } else {
    const inserted = await db
      .insert(siteThemes)
      .values({
        name,
        cssVariables,
        isCustom: true,
        isActive: false,
      })
      .returning()

    newTheme = inserted[0]!
  }

  return newTheme
}

/**
 * Delete a theme (cannot delete active theme or preset themes)
 */
export async function deleteTheme(themeId: number): Promise<void> {
  const theme = await db
    .select()
    .from(siteThemes)
    .where(eq(siteThemes.id, themeId))
    .limit(1)

  if (!theme[0]) {
    throw new Error('Theme not found')
  }

  if (theme[0].isActive) {
    throw new Error('Cannot delete the active theme')
  }

  if (!theme[0].isCustom) {
    throw new Error('Cannot delete preset themes')
  }

  await db.delete(siteThemes).where(eq(siteThemes.id, themeId))
}

/**
 * Validate CSS variables format and required properties
 */
export function validateThemeCSS(cssString: string): {
  isValid: boolean
  errors: string[]
  variables: Record<string, string>
  hasDarkMode?: boolean
} {
  const errors: string[] = []
  const variables: Record<string, string> = {}

  // Core required CSS variables for a complete theme
  const coreRequiredVariables = [
    '--background',
    '--foreground',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--destructive',
    '--destructive-foreground',
    '--border',
    '--input',
    '--ring',
  ]

  // Optional but recommended variables for enhanced themes
  const optionalVariables = [
    '--card',
    '--card-foreground',
    '--popover',
    '--popover-foreground',
    '--radius',
    // Tailwind v4 chart colors
    '--chart-1',
    '--chart-2',
    '--chart-3',
    '--chart-4',
    '--chart-5',
    // Sidebar variables
    '--sidebar',
    '--sidebar-foreground',
    '--sidebar-primary',
    '--sidebar-primary-foreground',
    '--sidebar-accent',
    '--sidebar-accent-foreground',
    '--sidebar-border',
    '--sidebar-ring',
    // Font variables
    '--font-sans',
    '--font-serif',
    '--font-mono',
    // Shadow variables
    '--shadow',
    '--shadow-sm',
    '--shadow-md',
    '--shadow-lg',
    '--shadow-xl',
    '--shadow-2xl',
  ]

  try {
    // Use the updated parseCSS function
    const parseResult = parseCSS(cssString)

    if (!parseResult.success) {
      errors.push(...parseResult.errors)
      return { isValid: false, errors, variables }
    }

    Object.assign(variables, parseResult.variables)

    // Check for core required variables
    const missingCore = coreRequiredVariables.filter(
      (required) => !variables[required],
    )

    if (missingCore.length > 0) {
      errors.push(`Missing core variables: ${missingCore.join(', ')}`)
    }

    // Validate variable values
    Object.entries(variables).forEach(([name, value]) => {
      // Basic validation - ensure value is not empty and doesn't contain dangerous content
      if (
        !value ||
        value.includes('<script') ||
        value.includes('javascript:')
      ) {
        errors.push(`Invalid value for ${name}: ${value}`)
      }

      // Allow longer values for complex CSS like shadows and fonts
      if (value.length > 500) {
        errors.push(`Value too long for ${name}: ${value.substring(0, 50)}...`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      variables,
      hasDarkMode: parseResult.hasDarkMode,
    }
  } catch (error) {
    errors.push(
      `CSS parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    return { isValid: false, errors, variables }
  }
}

/**
 * Get theme by ID
 */
export async function getThemeById(id: number): Promise<SiteTheme | null> {
  const theme = await db
    .select()
    .from(siteThemes)
    .where(eq(siteThemes.id, id))
    .limit(1)

  return theme[0] || null
}
