'use client'

import { useEffect, useState } from 'react'

export function ThemeInjector() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadActiveTheme = async () => {
      try {
        // Fetch the active theme from the API route
        const response = await fetch('/api/themes/active?_=' + Date.now()) // Cache bust
        if (response.ok) {
          const theme = await response.json()
          if (theme?.cssContent) {
            console.log('🎨 Loading theme:', theme.name, 'CSS length:', theme.cssContent.length)
            
            // Remove ALL existing theme styles to prevent conflicts
            const existingStyles = document.querySelectorAll('#dynamic-theme-styles, #theme-preview-styles, #server-theme-styles')
            existingStyles.forEach(style => style.remove())

            // Process and enhance CSS content for better specificity
            const processedCSS = processThemeCSS(theme.cssContent, theme.name)

            // Inject with high priority positioning and specificity
            const style = document.createElement('style')
            style.id = 'dynamic-theme-styles'
            style.textContent = processedCSS
            
            // Insert at the end of head for highest precedence
            document.head.appendChild(style)
            
            // Force styles to apply with DOM manipulation
            document.documentElement.style.setProperty('--theme-loaded', '1')
            
            console.log('✅ Theme CSS injected and applied successfully')
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('theme-applied', { detail: { theme } }))
          } else {
            console.log('⚠️ No active theme found or no CSS content')
            // Remove theme styles if no active theme
            const existingStyles = document.querySelectorAll('#dynamic-theme-styles, #theme-preview-styles')
            existingStyles.forEach(style => style.remove())
          }
        } else {
          console.error('❌ Failed to fetch active theme:', response.status)
        }
      } catch (error) {
        console.error('❌ Error loading active theme:', error)
      }
    }

    loadActiveTheme()

    // Listen for theme changes
    const handleThemeChange = () => {
      console.log('🔄 Theme change event received')
      setTimeout(loadActiveTheme, 100) // Small delay to ensure database is updated
    }
    window.addEventListener('theme-changed', handleThemeChange)

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange)
    }
  }, [mounted])

  return null
}

/**
 * Process theme CSS to ensure proper application and specificity
 */
function processThemeCSS(cssContent: string, themeName: string): string {
  // Add theme identification comment
  let processedCSS = `/* Theme: ${themeName} - Enhanced Dynamic Injection */\n`
  
  // If CSS doesn't contain @tailwind directives, we need to make variables more specific
  if (!cssContent.includes('@tailwind')) {
    console.log('🔧 Processing CSS without @tailwind directives')
    
    // Extract CSS variable definitions and make them more specific
    const cssVariableRegex = /:root\s*{([^}]+)}/g
    const darkModeRegex = /\.dark\s*{([^}]+)}/g
    
    let hasRootVars = false
    let hasDarkVars = false
    
    // Check if we have root variables
    const rootMatch = cssVariableRegex.exec(cssContent)
    if (rootMatch) {
      hasRootVars = true
      const rootVars = rootMatch[1]
      processedCSS += `
/* Enhanced root variables with higher specificity */
:root, 
html:root, 
body:root,
[data-theme="${themeName.toLowerCase()}"] {
${rootVars}
}

/* Force apply to html and body */
html {
${rootVars.replace(/--([^:]+):/g, '--$1: var(--$1) !important;')}
}
`
    }
    
    // Reset regex for dark mode
    cssVariableRegex.lastIndex = 0
    const darkMatch = darkModeRegex.exec(cssContent)
    if (darkMatch) {
      hasDarkVars = true
      const darkVars = darkMatch[1]
      processedCSS += `
/* Enhanced dark mode variables with higher specificity */
.dark,
html.dark,
body.dark,
[data-theme="${themeName.toLowerCase()}"].dark,
.dark [data-theme="${themeName.toLowerCase()}"] {
${darkVars}
}

/* Force apply dark variables */
html.dark {
${darkVars.replace(/--([^:]+):/g, '--$1: var(--$1) !important;')}
}
`
    }
    
    // If no standard :root or .dark blocks found, treat as raw CSS
    if (!hasRootVars && !hasDarkVars) {
      console.log('🔧 Raw CSS detected, wrapping in specificity enhancers')
      processedCSS += `
/* Raw CSS with enhanced specificity */
html body {
${cssContent}
}
`
    }
    
    // Add any remaining CSS that wasn't variables
    const remainingCSS = cssContent
      .replace(/:root\s*{[^}]+}/g, '')
      .replace(/\.dark\s*{[^}]+}/g, '')
      .trim()
    
    if (remainingCSS) {
      processedCSS += `\n/* Additional styles */\n${remainingCSS}`
    }
    
  } else {
    // CSS contains @tailwind directives, use as-is but add specificity markers
    console.log('🔧 Processing complete CSS with @tailwind directives')
    processedCSS += cssContent
  }
  
  // Add theme identifier for debugging
  processedCSS += `\n/* Theme identifier */\nhtml { --active-theme: "${themeName}"; }`
  
  return processedCSS
}