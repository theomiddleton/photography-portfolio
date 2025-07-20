import { getActiveTheme } from '~/lib/theme/theme-service'

/**
 * Server component that injects the active site theme CSS variables
 * Only applies to non-admin pages to avoid conflicts with admin dark mode
 */
export async function ThemeInjector() {
  let activeTheme
  let debugInfo = ''
  
  try {
    activeTheme = await getActiveTheme()
    debugInfo = activeTheme ? `Found theme "${activeTheme.name}" (ID: ${activeTheme.id})` : 'No active theme found in database'
  } catch (error) {
    debugInfo = `Error loading theme: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error('ThemeInjector error:', error)
  }

  // Debug comment to help troubleshoot
  const debugComment = `<!-- ThemeInjector: ${debugInfo} -->`

  if (!activeTheme) {
    console.log('ThemeInjector: No active theme found - site will use default CSS variables from globals.css')
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: debugComment,
        }}
      />
    )
  }

  console.log(`ThemeInjector: Applying theme "${activeTheme.name}" to non-admin pages`)

  // Simple approach: just inject the CSS with proper scoping
  // Replace :root with our scoped selector
  let cssContent = activeTheme.cssVariables
  
  // Replace :root selector with our scoped selector for non-admin pages
  cssContent = cssContent.replace(
    /:root\s*\{/g, 
    'html:not([data-admin="true"]) {'
  )

  const finalContent = `
${debugComment}
${cssContent}
  `.trim()

  return (
    <style
      id="site-theme-variables"
      dangerouslySetInnerHTML={{
        __html: finalContent,
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
