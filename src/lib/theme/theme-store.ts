'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeEditorState, Theme } from '~/types/theme'
import { defaultLightThemeStyles, defaultDarkThemeStyles } from '~/lib/theme/default-themes'
import { getSystemPreference } from '~/lib/theme/apply-theme'

interface EditorStore {
  themeState: ThemeEditorState
  setThemeState: (themeState: ThemeEditorState) => void
  updateThemeMode: (mode: Theme) => void
  updateThemeStyle: (mode: Theme, key: string, value: string) => void
  resetToDefaults: () => void
}

const createDefaultThemeState = (): ThemeEditorState => ({
  currentMode: getSystemPreference(),
  styles: {
    light: defaultLightThemeStyles,
    dark: defaultDarkThemeStyles
  }
})

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, _get) => ({
      themeState: createDefaultThemeState(),
      
      setThemeState: (themeState) => set({ themeState }),
      
      updateThemeMode: (mode) =>
        set((state) => ({
          themeState: {
            ...state.themeState,
            currentMode: mode
          }
        })),
      
      updateThemeStyle: (mode, key, value) =>
        set((state) => ({
          themeState: {
            ...state.themeState,
            styles: {
              ...state.themeState.styles,
              [mode]: {
                ...state.themeState.styles[mode],
                [key]: value
              }
            }
          }
        })),
      
      resetToDefaults: () => set({ themeState: createDefaultThemeState() })
    }),
    {
      name: 'editor-storage',
      partialize: (state) => ({ themeState: state.themeState })
    }
  )
)