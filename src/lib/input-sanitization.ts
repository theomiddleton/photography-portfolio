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
  options: SanitizationOptions = {},
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

  // Apply character filtering - remove characters NOT in the allowed set
  if (options.allowedCharacters) {
    // Escape special regex characters in the source to prevent regex injection
    const escapedSource = options.allowedCharacters.source.replace(/[[\]\\^-]/g, '\\$&')
    sanitized = sanitized.replace(
      new RegExp(`[^${escapedSource}]`, 'g'),
      '',
    )
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
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&(?:#(?:x[0-9a-f]+|\d+)|[a-z0-9]+);?/gi, '') // Remove HTML entities (more comprehensive)
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols (potential for XSS)
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
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
    removeHtml: true,
  })

  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  // Additional security checks
  if (!emailRegex.test(sanitized)) return ''
  if (sanitized.includes('..')) return '' // No consecutive dots
  if (sanitized.startsWith('.') || sanitized.endsWith('.')) return '' // No leading/trailing dots
  
  return sanitized
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
    allowedCharacters: /[a-zA-Z\s\-'.]/,
  })
}

/**
 * Sanitize general text content
 */
export function sanitizeText(text: unknown, maxLength = 1000): string {
  return sanitizeString(text, {
    maxLength,
    trimWhitespace: true,
    removeHtml: true,
  })
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(fileName: unknown): string {
  const sanitized = sanitizeString(fileName, {
    maxLength: 255,
    trimWhitespace: true,
    removeHtml: true,
  })

  // Remove or replace dangerous characters in file names
  return sanitized
    .replace(/[<>:"/\\|?*\x00-\x1f\x7f-\x9f]/g, '') // Remove illegal file name characters including control chars
    .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, 'file') // Handle Windows reserved names
    .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])\./i, 'file.') // Handle Windows reserved names with extensions
    .replace(/^\./g, '') // Remove leading dots
    .replace(/\.+$/g, '') // Remove trailing dots
    .replace(/\s+$/g, '') // Remove trailing spaces
    .replace(/^\s+/g, '') // Remove leading spaces
    .substring(0, 255) // Ensure max length even after processing
}

/**
 * Sanitize URL paths
 */
export function sanitizeUrlPath(path: unknown): string {
  const sanitized = sanitizeString(path, {
    maxLength: 2000,
    trimWhitespace: true,
    removeHtml: true,
  })

  // Remove dangerous URL patterns
  return sanitized
    .replace(/\.\./g, '') // Remove path traversal attempts
    .replace(/\/+/g, '/') // Normalize multiple slashes
    .replace(/[<>"\s\x00-\x1f\x7f-\x9f]/g, '') // Remove dangerous characters and control chars
    .replace(/^\/+/, '/') // Normalize leading slashes
    .replace(/\/+$/, '') // Remove trailing slashes (except root)
    .replace(/[;&|`$(){}[\]]/g, '') // Remove shell injection characters
}

/**
 * Sanitize search queries
 */
export function sanitizeSearchQuery(query: unknown): string {
  return sanitizeString(query, {
    maxLength: 200,
    trimWhitespace: true,
    removeHtml: true,
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
  // IPv6 regex (more comprehensive)
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

  if (ipv4Regex.test(sanitized)) {
    // Additional validation for IPv4 octets
    const octets = sanitized.split('.')
    const validOctets = octets.every((octet) => {
      const num = parseInt(octet, 10)
      return num >= 0 && num <= 255 && octet === num.toString() // Prevent leading zeros
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
    removeHtml: true,
  })
}

/**
 * Deep sanitize an object (useful for form data, API requests)
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fieldSanitizers: Partial<Record<keyof T, (value: unknown) => string>> = {},
): Record<string, string> {
  if (!obj || typeof obj !== 'object') {
    return {}
  }

  const sanitized: Record<string, string> = {}
  const maxFields = 100 // Prevent DoS attacks with too many fields

  let fieldCount = 0
  for (const [key, value] of Object.entries(obj)) {
    if (fieldCount >= maxFields) break
    
    // Sanitize the key itself
    const sanitizedKey = sanitizeString(key, { maxLength: 100, removeHtml: true })
    if (!sanitizedKey) continue
    
    const sanitizer = fieldSanitizers[key as keyof T]
    if (sanitizer) {
      sanitized[sanitizedKey] = sanitizer(value)
    } else {
      sanitized[sanitizedKey] = sanitizeText(value, 1000)
    }
    
    fieldCount++
  }

  return sanitized
}
