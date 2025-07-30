'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEditorStore } from '~/lib/theme/theme-store'
import { applyThemeToElement } from '~/lib/theme/apply-theme'
import { useThemePresetFromUrl } from '~/hooks/use-theme-preset-from-url'
import type { Coords, Theme, ThemeEditorState } from '~/types/theme'

interface ThemeProviderProps extends React.ComponentProps<typeof NextThemesProvider> {
  children: React.ReactNode
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { themeState, updateThemeMode } = useEditorStore()
  const pathname = usePathname()

  // Handle theme preset from URL
  useThemePresetFromUrl()

  // Apply theme changes to DOM in real-time
  useEffect(() => {
    const root = document.documentElement
    if (!root) return

    applyThemeToElement(themeState, root)
  }, [themeState])

  // Handle theme mode changes
  const handleThemeChange = (newMode: Theme) => {
    updateThemeMode(newMode)
  }

  // Handle theme toggle with smooth transitions
  const handleThemeToggle = (coords?: Coords) => {
    const root = document.documentElement
    const newMode = themeState.currentMode === 'light' ? 'dark' : 'light'

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (!document.startViewTransition || prefersReducedMotion) {
      handleThemeChange(newMode)
      return
    }

    if (coords) {
      root.style.setProperty('--x', `${coords.x}px`)
      root.style.setProperty('--y', `${coords.y}px`)
    }

    document.startViewTransition(() => {
      handleThemeChange(newMode)
    })
  }

  // Provide context value for theme operations
  const contextValue = React.useMemo(
    () => ({
      themeState,
      handleThemeChange,
      handleThemeToggle
    }),
    [themeState]
  )

  // Only apply live theme system in admin routes
  const isAdminRoute = pathname.startsWith('/admin')

  if (!isAdminRoute) {
    return (
      <NextThemesProvider
        {...props}
        storageKey="admin-theme"
      >
        {children}
      </NextThemesProvider>
    )
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <NextThemesProvider
        {...props}
        storageKey="admin-theme"
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}

// Create context for theme operations
const ThemeContext = React.createContext<{
  themeState: ThemeEditorState
  handleThemeChange: (mode: Theme) => void
  handleThemeToggle: (coords?: Coords) => void
} | null>(null)

// Hook to use theme context
export const useThemeContext = () => {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}
