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
          if (theme) {
            // Remove existing dynamic theme styles
            const existingStyle = document.getElementById('dynamic-theme-styles')
            if (existingStyle) {
              existingStyle.remove()
            }

            // Inject the new theme CSS
            const style = document.createElement('style')
            style.id = 'dynamic-theme-styles'
            style.textContent = theme.cssContent
            document.head.appendChild(style)
          }
        }
      } catch (error) {
        console.error('Error loading active theme:', error)
      }
    }

    loadActiveTheme()

    // Listen for theme changes
    const handleThemeChange = () => loadActiveTheme()
    window.addEventListener('theme-changed', handleThemeChange)

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange)
    }
  }, [mounted])

  return null
}