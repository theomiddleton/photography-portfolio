import { getActiveTheme } from '~/lib/theme/theme-service'

/**
 * Server component that injects the active theme CSS variables
 */
export async function ThemeInjector() {
  const activeTheme = await getActiveTheme()

  if (!activeTheme) {
    return null
  }

  // Convert CSS variables to inline styles
  const cssContent = activeTheme.cssVariables

  return (
    <style
      id="theme-variables"
      dangerouslySetInnerHTML={{
        __html: cssContent,
      }}
    />
  )
}

/**
 * Get theme CSS as a string for preview purposes
 */
export async function getThemeCSS(): Promise<string> {
  const activeTheme = await getActiveTheme()
  return activeTheme?.cssVariables || ''
}
