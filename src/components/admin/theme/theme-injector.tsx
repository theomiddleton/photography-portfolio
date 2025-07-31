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
        const response = await fetch('/api/themes/active')
        if (response.ok) {
          const theme = await response.json()
          if (theme?.cssContent) {
            console.log('Loading theme:', theme.name, 'CSS length:', theme.cssContent.length)
            
            // Remove existing dynamic theme styles (but keep server styles)
            const existingStyle = document.getElementById('dynamic-theme-styles')
            if (existingStyle) {
              existingStyle.remove()
            }

            // Always inject the theme CSS to ensure it applies
            const style = document.createElement('style')
            style.id = 'dynamic-theme-styles'
            style.textContent = `/* Theme: ${theme.name} - Dynamic */\n${theme.cssContent}`
            document.head.appendChild(style)
            
            console.log('Theme CSS injected successfully')
          } else {
            console.log('No active theme found or no CSS content')
          }
        } else {
          console.error('Failed to fetch active theme:', response.status)
        }
      } catch (error) {
        console.error('Error loading active theme:', error)
      }
    }

    loadActiveTheme()

    // Listen for theme changes
    const handleThemeChange = () => {
      console.log('Theme change event received')
      loadActiveTheme()
    }
    window.addEventListener('theme-changed', handleThemeChange)

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange)
    }
  }, [mounted])

  return null
}