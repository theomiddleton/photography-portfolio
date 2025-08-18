// Comprehensive input sanitization utilities for security

export interface SanitizationOptions {
  maxLength?: number
  allowedCharacters?: RegExp
  trimWhitespace?: boolean
  toLowerCase?: boolean
  removeHtml?: boolean
}

/**
 * Sanitize string input with various security measures
 */
export function sanitizeString(
  input: unknown, 
  options: SanitizationOptions = {}
): string {
  if (typeof input !== 'string') {
    return ''
  }

  let sanitized = input

  // Trim whitespace if requested
  if (options.trimWhitespace !== false) {
    sanitized = sanitized.trim()
  }

  // Convert to lowercase if requested
  if (options.toLowerCase) {
    sanitized = sanitized.toLowerCase()
  }

  // Remove HTML tags and entities
  if (options.removeHtml !== false) {
    sanitized = removeHtmlTags(sanitized)
  }

  // Apply character filtering
  if (options.allowedCharacters) {
    sanitized = sanitized.replace(options.allowedCharacters, '')
  }

  // Apply length limits
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.slice(0, options.maxLength)
  }

  return sanitized
}

/**
 * Remove HTML tags and decode HTML entities
 */
export function removeHtmlTags(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&[#\w]+;/g, '') // Remove HTML entities
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: unknown): string {
  const sanitized = sanitizeString(email, {
    maxLength: 255,
    trimWhitespace: true,
    toLowerCase: true,
    removeHtml: true
  })

  // Additional email-specific validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(sanitized) ? sanitized : ''
}

/**
 * Sanitize names (person names, display names, etc.)
 */
export function sanitizeName(name: unknown): string {
  return sanitizeString(name, {
    maxLength: 100,
    trimWhitespace: true,
    removeHtml: true,
    // Allow letters, spaces, hyphens, apostrophes, and periods
    allowedCharacters: /[^a-zA-Z\s\-'.]/g
  })
}

/**
 * Sanitize general text content
 */
export function sanitizeText(text: unknown, maxLength = 1000): string {
  return sanitizeString(text, {
    maxLength,
    trimWhitespace: true,
    removeHtml: true
  })
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(fileName: unknown): string {
  const sanitized = sanitizeString(fileName, {
    maxLength: 255,
    trimWhitespace: true,
    removeHtml: true
  })

  // Remove or replace dangerous characters in file names
  return sanitized
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove illegal file name characters
    .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, 'file') // Handle Windows reserved names
    .replace(/^\./g, '') // Remove leading dots
    .replace(/\.+$/g, '') // Remove trailing dots
}

/**
 * Sanitize URL paths
 */
export function sanitizeUrlPath(path: unknown): string {
  const sanitized = sanitizeString(path, {
    maxLength: 2000,
    trimWhitespace: true,
    removeHtml: true
  })

  // Remove dangerous URL patterns
  return sanitized
    .replace(/\.\./g, '') // Remove path traversal attempts
    .replace(/\/+/g, '/') // Normalize multiple slashes
    .replace(/[<>"\s]/g, '') // Remove dangerous characters
}

/**
 * Sanitize search queries
 */
export function sanitizeSearchQuery(query: unknown): string {
  return sanitizeString(query, {
    maxLength: 200,
    trimWhitespace: true,
    removeHtml: true
  })
}

/**
 * Validate and sanitize IP addresses
 */
export function sanitizeIPAddress(ip: unknown): string {
  if (typeof ip !== 'string') return ''
  
  const sanitized = ip.trim()
  
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/
  
  if (ipv4Regex.test(sanitized)) {
    // Additional validation for IPv4 octets
    const octets = sanitized.split('.')
    const validOctets = octets.every(octet => {
      const num = parseInt(octet, 10)
      return num >= 0 && num <= 255
    })
    return validOctets ? sanitized : ''
  }
  
  if (ipv6Regex.test(sanitized)) {
    return sanitized
  }
  
  return ''
}

/**
 * Sanitize user agent strings
 */
export function sanitizeUserAgent(userAgent: unknown): string {
  return sanitizeString(userAgent, {
    maxLength: 500,
    trimWhitespace: true,
    removeHtml: true
  })
}

/**
 * Deep sanitize an object (useful for form data, API requests)
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fieldSanitizers: Partial<Record<keyof T, (value: unknown) => string>> = {}
): Record<string, string> {
  const sanitized: Record<string, string> = {}

  for (const [key, value] of Object.entries(obj)) {
    const sanitizer = fieldSanitizers[key as keyof T]
    if (sanitizer) {
      sanitized[key] = sanitizer(value)
    } else {
      sanitized[key] = sanitizeText(value, 1000)
    }
  }

  return sanitized
}