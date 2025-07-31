/**
 * CSS Theme Validation utilities
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ColorFormatInfo {
  format: string
  description: string
  example: string
}

export const supportedColorFormats: ColorFormatInfo[] = [
  {
    format: 'HEX',
    description: 'Hexadecimal color notation',
    example: '#3b82f6 or #3b82f6ff'
  },
  {
    format: 'RGB',
    description: 'Red, Green, Blue values',
    example: 'rgb(59, 130, 246) or rgba(59, 130, 246, 0.5)'
  },
  {
    format: 'HSL',
    description: 'Hue, Saturation, Lightness values',
    example: 'hsl(217, 91%, 60%) or hsla(217, 91%, 60%, 0.5)'
  },
  {
    format: 'OKLCH',
    description: 'Modern perceptual color space',
    example: 'oklch(0.7 0.15 264)'
  },
  {
    format: 'CSS Variables',
    description: 'Using HSL space values for shadcn/ui compatibility',
    example: '217 91% 60% (no hsl() wrapper for CSS variables)'
  }
]

export const themeSourceRecommendations = [
  {
    name: 'shadcn/ui Themes',
    description: 'Official shadcn/ui theme gallery with copy-paste CSS. Visit ui.shadcn.com/themes for ready-made themes.'
  },
  {
    name: 'TweakCN',
    description: 'Community themes and customizations for shadcn/ui. Search for "TweakCN" for community contributions.'
  },
  {
    name: 'Tailwind UI Colors',
    description: 'Professional color palettes and design systems. Check Tailwind documentation for color references.'
  },
  {
    name: 'Radix Colors',
    description: 'Beautiful, accessible color system by Radix UI. Visit Radix UI documentation for color systems.'
  },
  {
    name: 'Coolors.co',
    description: 'Color palette generator and inspiration. Search for "Coolors" to find palette generators.'
  }
]

/**
 * Validates CSS content for theme compatibility
 */
export function validateThemeCSS(cssContent: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!cssContent || cssContent.trim().length === 0) {
    errors.push('CSS content cannot be empty')
    return { isValid: false, errors, warnings }
  }

  // Check for basic CSS structure (more lenient)
  const hasBasicCSS = cssContent.includes('@tailwind') || 
                      cssContent.includes(':root') || 
                      cssContent.includes('--') ||
                      cssContent.includes('{') // Any CSS block
  if (!hasBasicCSS) {
    warnings.push('CSS should include Tailwind directives, CSS variables, or style definitions for best compatibility')
  }

  // Check for shadcn/ui compatibility (but don't require it)
  const shadcnVariables = [
    '--background',
    '--foreground', 
    '--primary',
    '--secondary',
    '--muted',
    '--accent',
    '--destructive',
    '--border',
    '--input',
    '--ring'
  ]

  const foundShadcnVars = shadcnVariables.filter(variable => cssContent.includes(variable))
  if (foundShadcnVars.length > 0 && foundShadcnVars.length < shadcnVariables.length) {
    const missingShadcnVars = shadcnVariables.filter(variable => !cssContent.includes(variable))
    warnings.push(`Partial shadcn/ui compatibility: missing ${missingShadcnVars.slice(0, 3).join(', ')}${missingShadcnVars.length > 3 ? '...' : ''}`)
  }

  // Check for dark mode support
  const hasDarkMode = cssContent.includes('.dark') || cssContent.includes('[data-theme="dark"]')
  if (!hasDarkMode && cssContent.includes(':root')) {
    warnings.push('No dark mode styles detected. Consider adding .dark selector for complete theme support')
  }

  // Basic CSS syntax validation (more forgiving)
  try {
    // Check for balanced braces
    const openBraces = (cssContent.match(/\{/g) || []).length
    const closeBraces = (cssContent.match(/\}/g) || []).length
    
    if (openBraces !== closeBraces && openBraces > 0) {
      errors.push('CSS syntax error: Unbalanced braces')
    }

    // Check for basic CSS property format (if there are braces)
    if (cssContent.includes('{')) {
      const hasValidProperties = /[\w-]+\s*:\s*[^;]+[;}]/.test(cssContent)
      if (!hasValidProperties) {
        errors.push('CSS syntax error: No valid CSS properties found')
      }
    }

  } catch (error) {
    errors.push('CSS syntax validation failed')
  }

  // Check file size (warn if too large)
  const sizeKB = new Blob([cssContent]).size / 1024
  if (sizeKB > 500) {
    warnings.push(`Large CSS file (${Math.round(sizeKB)}KB). Consider optimizing for better performance`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates color value format
 */
export function validateColorFormat(color: string): { isValid: boolean; format?: string } {
  const colorPatterns = {
    hex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/,
    rgb: /^rgba?\(\s*(\d+|(\d*\.\d+))\s*,\s*(\d+|(\d*\.\d+))\s*,\s*(\d+|(\d*\.\d+))\s*(,\s*(\d+|(\d*\.\d+)))?\s*\)$/,
    hsl: /^hsla?\(\s*(\d+|(\d*\.\d+))\s*,\s*(\d+|(\d*\.\d+))%\s*,\s*(\d+|(\d*\.\d+))%\s*(,\s*(\d+|(\d*\.\d+)))?\s*\)$/,
    oklch: /^oklch\(\s*(\d+|(\d*\.\d+))\s+(\d+|(\d*\.\d+))\s+(\d+|(\d*\.\d+))\s*\)$/,
    cssVariable: /^(\d+|(\d*\.\d+))\s+(\d+|(\d*\.\d+))%\s+(\d+|(\d*\.\d+))%$/ // HSL space-separated values for CSS variables
  }

  for (const [format, pattern] of Object.entries(colorPatterns)) {
    if (pattern.test(color.trim())) {
      return { isValid: true, format }
    }
  }

  return { isValid: false }
}

/**
 * Extract colors from CSS content for automatic swatch generation
 */
export function extractColorsFromCSS(cssContent: string): {
  primary?: string
  secondary?: string
  accent?: string
  background?: string
  foreground?: string
} {
  const colors: Record<string, string> = {}
  
  // Common CSS variable patterns to look for
  const colorMappings = [
    { key: 'primary', patterns: ['--primary:', '--color-primary:', '--primary-500:', '--primary-foreground:'] },
    { key: 'secondary', patterns: ['--secondary:', '--color-secondary:', '--secondary-500:', '--secondary-foreground:'] },
    { key: 'accent', patterns: ['--accent:', '--color-accent:', '--accent-500:', '--accent-foreground:'] },
    { key: 'background', patterns: ['--background:', '--color-background:', '--bg-color:', '--bg-primary:'] },
    { key: 'foreground', patterns: ['--foreground:', '--color-foreground:', '--text-color:', '--text-primary:'] }
  ]

  // Extract values from CSS variables
  colorMappings.forEach(({ key, patterns }) => {
    for (const pattern of patterns) {
      const regex = new RegExp(`${pattern.replace(':', '\\s*:\\s*')}([^;\\n}]+)`, 'gi')
      const matches = cssContent.matchAll(regex)
      
      for (const match of matches) {
        if (match[1]) {
          let value = match[1].trim()
          
          // Convert CSS variable values to proper colors
          if (/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%/.test(value)) {
            // HSL space-separated values (shadcn/ui format)
            value = `hsl(${value})`
          }
          
          // Validate the extracted color
          const validation = validateColorFormat(value)
          if (validation.isValid) {
            colors[key] = value
            break // Use first valid match
          }
        }
      }
    }
  })

  // Fallback: look for common hex colors in the CSS
  if (Object.keys(colors).length === 0) {
    const hexColors = cssContent.match(/#[A-Fa-f0-9]{6}(?![A-Fa-f0-9])|#[A-Fa-f0-9]{3}(?![A-Fa-f0-9])/g)
    if (hexColors && hexColors.length > 0) {
      // Use unique colors only
      const uniqueColors = [...new Set(hexColors)]
      colors.primary = uniqueColors[0] || '#3b82f6'
      colors.secondary = uniqueColors[1] || '#6b7280'
      colors.accent = uniqueColors[2] || '#0066cc'
      colors.background = '#ffffff'
      colors.foreground = '#000000'
    }
  }

  // Provide sensible defaults if nothing was found
  return {
    primary: colors.primary || '#3b82f6',
    secondary: colors.secondary || '#6b7280', 
    accent: colors.accent || '#0066cc',
    background: colors.background || '#ffffff',
    foreground: colors.foreground || '#000000'
  }
}