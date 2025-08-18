// Redis-based rate limiter for API protection using Upstash Redis
// Provides distributed rate limiting across multiple instances

import { Redis } from '@upstash/redis'
import { env } from '~/env.js'
import { siteConfig } from '~/config/site'
import { getSession } from '~/lib/auth/auth'

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

export interface RateLimitConfig {
  name: string // Namespace for the rate limiter to prevent cross-endpoint collisions
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export function rateLimit(config: RateLimitConfig) {
  return {
    check: async (
      identifier: string,
    ): Promise<{ success: boolean; reset: number; remaining: number; limit: number }> => {
      try {
        const now = Date.now()
        const windowStart = Math.floor(now / config.windowMs) * config.windowMs
        const resetTime = windowStart + config.windowMs
        const key = `rate_limit:${config.name}:v1:${identifier}:${windowStart}`

        // Use Redis INCR command with expiration for atomic operation
        const current = await redis.incr(key)

        // Set expiration only on first increment to avoid race conditions
        if (current === 1) {
          await redis.pexpire(key, config.windowMs)
        }

        if (current > config.maxRequests) {
          return {
            success: false,
            reset: resetTime,
            remaining: 0,
            limit: config.maxRequests,
          }
        }

        return {
          success: true,
          reset: resetTime,
          remaining: config.maxRequests - current,
          limit: config.maxRequests,
        }
      } catch (error) {
        // On Redis failure, fail closed for critical endpoints, open for others
        console.error('Rate limiter Redis error:', error)
        
        // Fail closed for critical auth endpoints
        const criticalEndpoints = ['passwordAttempt', 'email', 'upload']
        if (criticalEndpoints.includes(config.name)) {
          return {
            success: false,
            reset: Date.now() + config.windowMs,
            remaining: 0,
            limit: config.maxRequests,
          }
        }
        
        // Fail open for less critical endpoints
        return {
          success: true,
          reset: Date.now() + config.windowMs,
          remaining: config.maxRequests - 1,
          limit: config.maxRequests,
        }
      }
    },
  }
}

// Helper function to check if user is admin
async function isUserAdmin(): Promise<boolean> {
  try {
    const session = await getSession()
    return session?.role === 'admin'
  } catch {
    return false
  }
}

// Create configurable rate limiter that respects admin privileges
export function createConfigurableRateLimit(
  limitType: keyof typeof siteConfig.rateLimiting.limits,
) {
  return {
    check: async (
      identifier: string,
    ): Promise<{ success: boolean; reset: number; remaining: number; limit: number }> => {
      try {
        const baseLimit = siteConfig.rateLimiting.limits[limitType]
        const isAdmin = await isUserAdmin()
        const maxRequests = isAdmin
          ? baseLimit * siteConfig.rateLimiting.adminMultiplier
          : baseLimit

        const config: RateLimitConfig = {
          name: String(limitType),
          windowMs: 60 * 1000, // 1 minute
          maxRequests,
        }

        const limiter = rateLimit(config)
        return await limiter.check(identifier)
      } catch (error) {
        console.error('Configurable rate limiter error:', error)
        return {
          success: true,
          reset: Date.now() + 60 * 1000,
          remaining: siteConfig.rateLimiting.limits[limitType] - 1,
          limit: siteConfig.rateLimiting.limits[limitType],
        }
      }
    },
  }
}

// Pre-configured rate limiters for different API endpoints using configurable limits
export const checkoutRateLimit = createConfigurableRateLimit('checkout')
export const emailRateLimit = createConfigurableRateLimit('email')
export const webhookRateLimit = createConfigurableRateLimit('webhook')
export const uploadRateLimit = createConfigurableRateLimit('upload')
export const imageProcessingRateLimit = createConfigurableRateLimit('imageProcessing')
export const aiGenerationRateLimit = createConfigurableRateLimit('aiGeneration')
export const passwordAttemptRateLimit = createConfigurableRateLimit('passwordAttempt')

// For routes that don't have a specific type, we can create a generic revalidate one
export const revalidateRateLimit = createConfigurableRateLimit('revalidate')

export function getClientIP(request: Request): string {
  // Try to get real IP from various headers (handle proxy/CDN scenarios)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')

  let clientIP = 'unknown'

  if (forwarded) {
    // Take the first IP in the chain and validate it
    const firstIP = forwarded.split(',')[0].trim()
    if (isValidIP(firstIP)) {
      clientIP = firstIP
    }
  } else if (realIP && isValidIP(realIP)) {
    clientIP = realIP
  } else if (cfIP && isValidIP(cfIP)) {
    clientIP = cfIP
  }

  return clientIP
}

// Basic IP validation to prevent header injection
function isValidIP(ip: string): boolean {
  if (!ip || ip.length > 45) return false // Max IPv6 length
  
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/
  
  if (ipv4Regex.test(ip)) {
    // Additional validation for IPv4 octets
    const octets = ip.split('.')
    return octets.every(octet => {
      const num = parseInt(octet, 10)
      return num >= 0 && num <= 255
    })
  }
  
  return ipv6Regex.test(ip)
}
