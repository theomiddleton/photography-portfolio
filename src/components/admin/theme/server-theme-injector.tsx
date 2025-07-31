import { getActiveTheme } from '~/server/actions/themes'

/**
 * Server-side theme injector that prevents theme flash on initial load
 */
export async function ServerThemeInjector() {
  try {
    const activeTheme = await getActiveTheme()
    
    if (activeTheme?.cssContent) {
      console.log('🎨 Server: Injecting theme', activeTheme.name)
      
      // Process CSS for better compatibility
      let processedCSS = activeTheme.cssContent
      
      // Ensure CSS has proper specificity for server injection
      if (!processedCSS.includes('@tailwind')) {
        // For CSS without @tailwind directives, add specificity
        processedCSS = `
/* Server Theme: ${activeTheme.name} */
${processedCSS}

/* Ensure server theme variables take precedence */
html:root {
  --theme-source: "server";
  --active-theme: "${activeTheme.name}";
}
`
      } else {
        // Add theme identifier for debugging
        processedCSS += `\n/* Server Theme: ${activeTheme.name} */\nhtml { --active-theme: "${activeTheme.name}"; --theme-source: "server"; }`
      }
      
      return (
        <style 
          id="server-theme-styles"
          dangerouslySetInnerHTML={{ 
            __html: processedCSS
          }} 
        />
      )
    }
  } catch (error) {
    console.error('❌ Error loading server theme:', error)
  }
  
  return null
}