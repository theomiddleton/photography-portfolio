import type { ThemeEditorState, Theme, ThemeConfiguration, ThemeStyles } from '~/types/theme'
import { COMMON_NON_COLOR_KEYS } from '~/types/theme'

/**
 * Color formatter utility to convert colors to HSL format
 */
export const colorFormatter = (color: string, _format: 'hsl' | 'hex' = 'hsl', _precision = 4): string => {
  // If already in HSL format, return as is
  if (color.includes(' ') && !color.includes('#')) {
    return color
  }
  
  // For now, return the color as is since our defaults are already in HSL
  // This could be expanded to handle hex/rgb conversion
  return color
}

/**
 * Apply a single style property to an element
 */
export const applyStyleToElement = (element: HTMLElement, key: string, value: string): void => {
  element.style.setProperty(`--${key}`, value)
}

/**
 * Update theme class on root element
 */
const updateThemeClass = (root: HTMLElement, mode: Theme): void => {
  if (mode === 'light') {
    root.classList.remove('dark')
  } else {
    root.classList.add('dark')
  }
}

/**
 * Apply common styles (non-color properties) to element
 */
const applyCommonStyles = (root: HTMLElement, themeStyles: ThemeStyles): void => {
  COMMON_NON_COLOR_KEYS.forEach((key) => {
    const value = themeStyles[key]
    if (value !== undefined) {
      applyStyleToElement(root, key, value)
    }
  })
}

/**
 * Apply theme colors for a specific mode
 */
const applyThemeColors = (
  root: HTMLElement,
  themeStyles: ThemeConfiguration,
  mode: Theme
): void => {
  Object.entries(themeStyles[mode]).forEach(([key, value]) => {
    if (
      typeof value === 'string' &&
      !COMMON_NON_COLOR_KEYS.includes(
        key as (typeof COMMON_NON_COLOR_KEYS)[number]
      )
    ) {
      const hslValue = colorFormatter(value, 'hsl', 4)
      applyStyleToElement(root, key, hslValue)
    }
  })
}

/**
 * Set shadow variables (placeholder for future shadow system)
 */
const setShadowVariables = (_themeState: ThemeEditorState): void => {
  const root = document.documentElement
  if (!root) return
  
  // Placeholder for dynamic shadow generation
  // This could be expanded to generate shadows based on theme colors
  root.style.setProperty('--shadow-2xs', '0 1px 2px 0 rgb(0 0 0 / 0.05)')
  root.style.setProperty('--shadow-xs', '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)')
  root.style.setProperty('--shadow-sm', '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)')
  root.style.setProperty('--shadow', '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)')
  root.style.setProperty('--shadow-md', '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)')
  root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)')
  root.style.setProperty('--shadow-xl', '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)')
  root.style.setProperty('--shadow-2xl', '0 25px 50px -12px rgb(0 0 0 / 0.25)')
}

/**
 * Main function to apply theme to element
 */
export const applyThemeToElement = (
  themeState: ThemeEditorState,
  rootElement: HTMLElement
): void => {
  const { currentMode: mode, styles: themeStyles } = themeState

  if (!rootElement) return

  updateThemeClass(rootElement, mode)
  // Apply common styles (like border-radius) based on the 'light' mode definition
  applyCommonStyles(rootElement, themeStyles.light)
  // Apply mode-specific colors
  applyThemeColors(rootElement, themeStyles, mode)
  // Apply shadow variables
  setShadowVariables(themeState)
}

/**
 * Get system preference for dark mode
 */
export const getSystemPreference = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Save theme state to localStorage
 */
export const saveThemeToStorage = (themeState: ThemeEditorState): void => {
  try {
    const storageKey = 'editor-storage'
    const existingStorage = localStorage.getItem(storageKey)
    const parsedStorage: { state?: { themeState?: ThemeEditorState } } = existingStorage 
      ? JSON.parse(existingStorage) as { state?: { themeState?: ThemeEditorState } } 
      : {}
    
    const updatedStorage = {
      ...parsedStorage,
      state: {
        ...parsedStorage.state,
        themeState
      }
    }
    
    localStorage.setItem(storageKey, JSON.stringify(updatedStorage))
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error)
  }
}

/**
 * Load theme state from localStorage
 */
export const loadThemeFromStorage = (): ThemeEditorState | null => {
  try {
    const storageKey = 'editor-storage'
    const persistedStateJSON = localStorage.getItem(storageKey)
    if (persistedStateJSON) {
      const parsedStorage = JSON.parse(persistedStateJSON) as { state?: { themeState?: ThemeEditorState } }
      return parsedStorage?.state?.themeState || null
    }
  } catch (error) {
    console.warn('Failed to load theme from localStorage:', error)
  }
  return null
}