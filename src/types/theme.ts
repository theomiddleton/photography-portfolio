export type Theme = 'light' | 'dark'

export interface ThemeStyles {
  // Color tokens
  background: string
  foreground: string
  card: string
  'card-foreground': string
  popover: string
  'popover-foreground': string
  primary: string
  'primary-foreground': string
  secondary: string
  'secondary-foreground': string
  muted: string
  'muted-foreground': string
  accent: string
  'accent-foreground': string
  destructive: string
  'destructive-foreground': string
  border: string
  input: string
  ring: string
  // Chart colors
  'chart-1': string
  'chart-2': string
  'chart-3': string
  'chart-4': string
  'chart-5': string
  // Sidebar colors
  'sidebar-background': string
  'sidebar-foreground': string
  'sidebar-primary': string
  'sidebar-primary-foreground': string
  'sidebar-accent': string
  'sidebar-accent-foreground': string
  'sidebar-border': string
  'sidebar-ring': string
  // Common properties (shared between themes)
  radius: string
  'font-sans': string
  'font-serif': string
  'letter-spacing': string
}

export interface ThemeConfiguration {
  light: ThemeStyles
  dark: ThemeStyles
}

export interface ThemeEditorState {
  currentMode: Theme
  styles: ThemeConfiguration
}

export interface Coords {
  x: number
  y: number
}

// Keys that are not colors and should be applied as common styles
export const COMMON_NON_COLOR_KEYS = [
  'radius',
  'font-sans', 
  'font-serif',
  'letter-spacing'
] as const