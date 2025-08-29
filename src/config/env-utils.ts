/**
 * Type-safe utility to retrieve NEXT_PUBLIC_ prefixed environment variables with default values
 * Supports string, number, and boolean type overrides
 */

/**
 * Get environment variable with type-safe defaults
 * @param key Environment variable key (should start with NEXT_PUBLIC_)
 * @param defaultValue Default value to use if environment variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnv(key: string, defaultValue: string): string
export function getEnv(key: string, defaultValue: number): number
export function getEnv(key: string, defaultValue: boolean): boolean
export function getEnv(key: string, defaultValue: string | number | boolean): string | number | boolean {
  const envValue = process.env[key]
  
  if (envValue === undefined || envValue === '') {
    return defaultValue
  }
  
  // Handle boolean conversion
  if (typeof defaultValue === 'boolean') {
    const lowerValue = envValue.toLowerCase()
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes'
  }
  
  // Handle number conversion
  if (typeof defaultValue === 'number') {
    const numValue = Number(envValue)
    return isNaN(numValue) ? defaultValue : numValue
  }
  
  // Return as string
  return envValue
}

/**
 * Get environment variable for nested object properties with type-safe defaults
 * @param key Environment variable key
 * @param defaultValue Default value to use if environment variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnvNested<T>(key: string, defaultValue: T): T {
  const envValue = process.env[key]
  
  if (envValue === undefined || envValue === '') {
    return defaultValue
  }
  
  // For complex objects, we expect JSON strings in environment variables
  if (typeof defaultValue === 'object' && defaultValue !== null) {
    try {
      return JSON.parse(envValue) as T
    } catch {
      return defaultValue
    }
  }
  
  return (envValue as unknown) as T
}