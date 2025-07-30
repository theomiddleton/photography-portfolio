'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEditorStore } from '~/lib/theme/theme-store'

export const useThemePresetFromUrl = () => {
  const searchParams = useSearchParams()
  const { setThemeState } = useEditorStore()

  useEffect(() => {
    const presetParam = searchParams.get('preset')
    
    if (presetParam) {
      try {
        // Decode the theme preset from URL
        const decodedPreset = decodeURIComponent(presetParam)
        const themeState = JSON.parse(decodedPreset)
        
        // Validate the theme state structure
        if (themeState.currentMode && themeState.styles) {
          setThemeState(themeState)
        }
      } catch (error) {
        console.warn('Failed to load theme preset from URL:', error)
      }
    }
  }, [searchParams, setThemeState])
}