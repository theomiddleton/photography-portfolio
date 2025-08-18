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

interface RateLimitEntry {
  count: number
  resetTime: number
}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export function rateLimit(config: RateLimitConfig) {
  return {
    check: async (
      identifier: string,
    ): Promise<{ success: boolean; reset: number; remaining: number }> => {
      try {
        const now = Date.now()
        const windowStart = Math.floor(now / config.windowMs) * config.windowMs
        const resetTime = windowStart + config.windowMs
        const key = `rate_limit:${identifier}:${windowStart}`

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
          }
        }

        return {
          success: true,
          reset: resetTime,
          remaining: config.maxRequests - current,
        }
      } catch (error) {
        // On Redis failure, fail open (allow request) to avoid blocking legitimate users
        console.error('Rate limiter Redis error:', error)
        return {
          success: true,
          reset: Date.now() + config.windowMs,
          remaining: config.maxRequests - 1,
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
export function createConfigurableRateLimit(limitType: keyof typeof siteConfig.rateLimiting.limits) {
  return {
    check: async (
      identifier: string,
    ): Promise<{ success: boolean; reset: number; remaining: number }> => {
      try {
        const baseLimit = siteConfig.rateLimiting.limits[limitType]
        const isAdmin = await isUserAdmin()
        const maxRequests = isAdmin ? baseLimit * siteConfig.rateLimiting.adminMultiplier : baseLimit
        
        const config: RateLimitConfig = {
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

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfIP) {
    return cfIP
  }

  // Fallback to a default identifier
  return 'unknown'
}
