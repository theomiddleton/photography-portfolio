// Redis-based rate limiter for API protection using Upstash Redis
// Provides distributed rate limiting across multiple instances

import { Redis } from '@upstash/redis'
import { env } from '~/env.js'

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

// Pre-configured rate limiters for different API endpoints
export const checkoutRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 checkout attempts per minute per IP
})

export const emailRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 emails per minute per IP
})

export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 webhook calls per minute (generous for Stripe)
})

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 file uploads per minute per IP (resource intensive)
})

export const imageProcessingRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 image processing requests per minute per IP
})

export const aiGenerationRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 AI generation requests per minute per IP (expensive)
})

export const passwordAttemptRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 password attempts per minute per IP
})

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
