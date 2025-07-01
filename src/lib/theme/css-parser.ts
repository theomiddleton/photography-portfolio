/**
 * Parse CSS variables from various input formats including Tailwind v4 themes
 */
export function parseCSS(input: string): {
  success: boolean
  variables: Record<string, string>
  errors: string[]
  hasDarkMode?: boolean
} {
  const errors: string[] = []
  const variables: Record<string, string> = {}
  let hasDarkMode = false

  try {
    // Clean up the input but preserve structure for complex themes
    let cleanInput = input
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .trim()

    // Handle Tailwind v4 format with multiple selectors
    if (cleanInput.includes(':root') || cleanInput.includes('.dark')) {
      // Extract from :root block first
      const rootMatch = cleanInput.match(/:root\s*{([^}]+)}/is)
      if (rootMatch) {
        parseVariablesFromBlock(rootMatch[1]!, variables)
      }

      // Check for dark mode variables
      const darkMatch = cleanInput.match(/\.dark\s*{([^}]+)}/is)
      if (darkMatch) {
        hasDarkMode = true
        // For now, we'll use the root variables as the base
        // In the future, we could store dark mode variables separately
      }

      // Handle @theme inline blocks (Tailwind v4)
      const themeMatch = cleanInput.match(/@theme\s+inline\s*{([^}]+)}/is)
      if (themeMatch) {
        // Extract variables from @theme block
        parseVariablesFromBlock(themeMatch[1]!, variables)
      }
    } else {
      // Fallback: treat entire input as variable declarations
      parseVariablesFromBlock(cleanInput, variables)
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
    hasDarkMode,
  }
}

/**
 * Parse CSS variables from a block of CSS declarations
 */
function parseVariablesFromBlock(
  block: string,
  variables: Record<string, string>,
) {
  // Handle both formats:
  // 1. --variable: value;
  // 2. --variable: hsl(value);
  // 3. --variable: calc(expression);
  // 4. --variable: var(--other-variable);

  const variablePattern = /--([\w-]+)\s*:\s*([^;]+)/g
  let match

  while ((match = variablePattern.exec(block)) !== null) {
    const [, name, value] = match
    if (name && value) {
      const variableName = `--${name.trim()}`
      let variableValue = value.trim().replace(/;$/, '')

      // Clean up Tailwind v4 HSL format - convert hsl() to raw values
      if (variableValue.startsWith('hsl(') && variableValue.endsWith(')')) {
        // Extract the HSL values from hsl(150.0000 8.3333% 95.2941%)
        const hslMatch = variableValue.match(/hsl\(([^)]+)\)/)
        if (hslMatch) {
          variableValue = hslMatch[1]!.trim()
        }
      }

      // Skip variables that reference other variables or complex calculations for now
      // These will be preserved as-is
      if (
        variableValue &&
        !variableValue.includes('var(--') &&
        !variableValue.includes('calc(')
      ) {
        variables[variableName] = variableValue
      } else if (variableValue) {
        // Store complex values as-is (calc, var references, etc.)
        variables[variableName] = variableValue
      }
    }
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
