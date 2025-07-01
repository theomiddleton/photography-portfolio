/**
 * Parse CSS variables from various input formats
 */
export function parseCSS(input: string): {
  success: boolean
  variables: Record<string, string>
  errors: string[]
} {
  const errors: string[] = []
  const variables: Record<string, string> = {}

  try {
    // Clean up the input
    let cleanInput = input
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\n|\r/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    // Handle different input formats
    if (cleanInput.includes(':root')) {
      // Extract from :root block
      const rootMatch = cleanInput.match(/:root\s*{([^}]+)}/i)
      if (rootMatch) {
        cleanInput = rootMatch[1]!
      }
    }

    // Parse CSS variable declarations
    const variablePattern = /--([\w-]+)\s*:\s*([^;]+)/g
    let match

    while ((match = variablePattern.exec(cleanInput)) !== null) {
      const [, name, value] = match
      if (name && value) {
        const variableName = `--${name.trim()}`
        const variableValue = value.trim().replace(/;$/, '')

        if (variableValue) {
          variables[variableName] = variableValue
        }
      }
    }

    if (Object.keys(variables).length === 0) {
      errors.push('No valid CSS variables found')
    }
  } catch (error) {
    errors.push(
      `Parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }

  return {
    success: errors.length === 0 && Object.keys(variables).length > 0,
    variables,
    errors,
  }
}

/**
 * Convert variables object back to CSS string
 */
export function variablesToCSS(variables: Record<string, string>): string {
  const cssLines = Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')

  return `:root {\n${cssLines}\n}`
}

/**
 * Validate and sanitize CSS variables
 */
export function sanitizeCSS(input: string): {
  sanitized: string
  warnings: string[]
} {
  const warnings: string[] = []
  const parsed = parseCSS(input)

  if (!parsed.success) {
    return { sanitized: input, warnings: parsed.errors }
  }

  const sanitizedVariables: Record<string, string> = {}

  // Sanitize each variable
  Object.entries(parsed.variables).forEach(([name, value]) => {
    // Check for potentially dangerous content
    if (
      value.includes('<script') ||
      value.includes('javascript:') ||
      value.includes('expression(')
    ) {
      warnings.push(`Potentially dangerous value removed for ${name}`)
      return
    }

    // Basic CSS value validation
    if (!value || value.length > 200) {
      warnings.push(`Invalid or too long value for ${name}`)
      return
    }

    sanitizedVariables[name] = value
  })

  return {
    sanitized: variablesToCSS(sanitizedVariables),
    warnings,
  }
}

/**
 * Extract theme name from CSS comment or return default
 */
export function extractThemeName(cssInput: string): string | null {
  // Look for theme name in comments
  const nameMatch = cssInput.match(/\/\*\s*(?:theme|name):\s*([^*]+)\*\//i)
  if (nameMatch) {
    return nameMatch[1]!.trim()
  }

  // Look for @name comment
  const atNameMatch = cssInput.match(/@name\s+([^\n\r]+)/i)
  if (atNameMatch) {
    return atNameMatch[1]!.trim()
  }

  return null
}
