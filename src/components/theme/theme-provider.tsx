import { getActiveTheme } from '~/lib/theme/theme-service'

/**
 * Component for previewing themes in modals/components
 */
export function ThemePreview({ cssVariables }: { cssVariables: string }) {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: cssVariables,
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
