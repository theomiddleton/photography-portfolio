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
    // Updated HSL pattern to support both comma-separated AND space-separated values
    hsl: /^hsla?\(\s*(\d+|(\d*\.\d+))\s*[,\s]\s*(\d+|(\d*\.\d+))%\s*[,\s]\s*(\d+|(\d*\.\d+))%\s*(,\s*(\d+|(\d*\.\d+)))?\s*\)$/,
    oklch: /^oklch\(\s*(\d+|(\d*\.\d+))\s+(\d+|(\d*\.\d+))\s+(\d+|(\d*\.\d+))\s*\)$/,
    cssVariable: /^(\d+|(\d*\.\d+))\s+(\d+|(\d*\.\d+))%\s+(\d+|(\d*\.\d+))%$/, // HSL space-separated values for CSS variables
    cssVariableRef: /^var\(--[\w-]+\)$/ // CSS variable references like var(--primary)
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
  
  console.log('🎨 Extracting colors from CSS...')
  
  // Enhanced CSS variable patterns with more variations
  const colorMappings = [
    { 
      key: 'primary', 
      patterns: [
        '--primary:', '--color-primary:', '--primary-500:', '--primary-600:', '--primary-700:',
        '--blue:', '--blue-500:', '--blue-600:', '--indigo:', '--indigo-500:'
      ]
    },
    { 
      key: 'secondary', 
      patterns: [
        '--secondary:', '--color-secondary:', '--secondary-500:', '--secondary-600:',
        '--gray:', '--gray-500:', '--slate:', '--slate-500:', '--neutral:', '--neutral-500:'
      ]
    },
    { 
      key: 'accent', 
      patterns: [
        '--accent:', '--color-accent:', '--accent-500:', '--accent-600:',
        '--violet:', '--violet-500:', '--purple:', '--purple-500:', '--pink:', '--pink-500:'
      ]
    },
    { 
      key: 'background', 
      patterns: [
        '--background:', '--color-background:', '--bg-color:', '--bg-primary:',
        '--white:', '--gray-50:', '--slate-50:', '--neutral-50:', '--stone-50:'
      ]
    },
    { 
      key: 'foreground', 
      patterns: [
        '--foreground:', '--color-foreground:', '--text-color:', '--text-primary:',
        '--black:', '--gray-900:', '--slate-900:', '--neutral-900:', '--stone-900:'
      ]
    }
  ]

  // Extract values from CSS variables with improved parsing
  colorMappings.forEach(({ key, patterns }) => {
    for (const pattern of patterns) {
      // More flexible regex that handles various spacing and semicolons
      const regex = new RegExp(`${pattern.replace(':', '\\s*:\\s*')}([^;\\n}]+)`, 'gi')
      const matches = cssContent.matchAll(regex)
      
      for (const match of matches) {
        if (match[1]) {
          let value = match[1].trim()
          
          // Clean up the value
          value = value.replace(/;$/, '').trim() // Remove trailing semicolon
          
          console.log(`Found ${key} candidate:`, value)
          
          // Convert various formats to standard color format
          let convertedValue = convertCSSValueToColor(value)
          
          // Validate the extracted color
          const validation = validateColorFormat(convertedValue)
          if (validation.isValid) {
            // Skip CSS variable references for swatch colors, but consider actual color values
            if (validation.format !== 'cssVariableRef') {
              colors[key] = convertedValue
              console.log(`✅ Extracted ${key}:`, convertedValue)
              break // Use first valid match
            } else {
              console.log(`ℹ️ Found CSS variable reference for ${key}, looking for actual color value...`)
            }
          } else {
            console.log(`❌ Invalid color format for ${key}:`, convertedValue)
          }
        }
      }
    }
  })

  // Enhanced fallback: look for various color formats in the CSS
  if (Object.keys(colors).length === 0) {
    console.log('🔍 No CSS variables found, looking for direct color values...')
    
    // Look for hex colors
    const hexColors = cssContent.match(/#[A-Fa-f0-9]{6}(?![A-Fa-f0-9])|#[A-Fa-f0-9]{3}(?![A-Fa-f0-9])/g)
    
    // Look for HSL colors (both comma and space separated)
    const hslColors = cssContent.match(/hsl\(\s*\d+(\.\d+)?\s*[,\s]\s*\d+(\.\d+)?%\s*[,\s]\s*\d+(\.\d+)?%\s*\)/g)
    
    // Look for RGB colors
    const rgbColors = cssContent.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g)
    
    const allColors = [
      ...(hexColors || []),
      ...(hslColors || []),
      ...(rgbColors || [])
    ]
    
    if (allColors.length > 0) {
      // Use unique colors only
      const uniqueColors = [...new Set(allColors)]
      console.log('🎨 Found direct colors:', uniqueColors)
      
      colors.primary = uniqueColors[0] || '#3b82f6'
      colors.secondary = uniqueColors[1] || '#6b7280'
      colors.accent = uniqueColors[2] || '#0066cc'
      
      // Try to find likely background colors (light colors)
      const lightColors = uniqueColors.filter(color => isLightColor(color))
      colors.background = lightColors[0] || '#ffffff'
      
      // Try to find likely foreground colors (dark colors)
      const darkColors = uniqueColors.filter(color => !isLightColor(color))
      colors.foreground = darkColors[0] || '#000000'
    }
  }

  // Only return colors that were actually extracted (not defaults)
  const extractedColors: any = {}
  const defaults = { primary: '#3b82f6', secondary: '#6b7280', accent: '#0066cc', background: '#ffffff', foreground: '#000000' }
  
  Object.entries(colors).forEach(([key, value]) => {
    if (value && value !== (defaults as any)[key]) {
      extractedColors[key] = value
    }
  })
  
  console.log('🎨 Final extracted colors:', extractedColors)
  return extractedColors
}

/**
 * Convert CSS variable value to a standard color format
 */
function convertCSSValueToColor(value: string): string {
  // Handle CSS variable references (just return the reference as is for now)
  if (value.startsWith('var(') && value.endsWith(')')) {
    return value
  }
  
  // Handle HSL space-separated values (shadcn/ui format)
  if (/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%/.test(value)) {
    return `hsl(${value})`
  }
  
  // Handle RGB space-separated values 
  if (/^\d+\s+\d+\s+\d+$/.test(value)) {
    return `rgb(${value.replace(/\s+/g, ', ')})`
  }
  
  // Handle oklch format
  if (/^\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/.test(value)) {
    return `oklch(${value})`
  }
  
  // Already a standard color format or invalid
  return value
}

/**
 * Determine if a color is likely a light color (background)
 */
function isLightColor(color: string): boolean {
  // Convert hex to RGB for lightness calculation
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5
  }
  
  // For HSL, check lightness value
  if (color.startsWith('hsl(')) {
    const match = color.match(/hsl\(\s*\d+\s*,\s*\d+%\s*,\s*(\d+)%\s*\)/)
    if (match) {
      const lightness = parseInt(match[1])
      return lightness > 50
    }
  }
  
  // Default assumption
  return false
}