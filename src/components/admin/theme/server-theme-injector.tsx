import { getActiveTheme } from '~/server/actions/themes'

/**
 * Server-side theme injector that prevents theme flash on initial load
 */
export async function ServerThemeInjector() {
  try {
    const activeTheme = await getActiveTheme()
    
    if (activeTheme?.cssContent) {
      return (
        <style 
          id="server-theme-styles"
          dangerouslySetInnerHTML={{ 
            __html: `/* Theme: ${activeTheme.name} */\n${activeTheme.cssContent}`
          }} 
        />
      )
    }
  } catch (error) {
    console.error('Error loading server theme:', error)
  }
  
  return null
}