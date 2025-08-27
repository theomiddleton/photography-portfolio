import { Redis } from '@upstash/redis'
import { env } from '~/env.js'

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

interface RateLimitConfig {
  window: number // Time window in seconds
  limit: number   // Number of requests allowed
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Authentication rate limiting
  'login': { window: 900, limit: 5 },           // 5 login attempts per 15 minutes
  'register': { window: 3600, limit: 3 },      // 3 registrations per hour
  'password_reset': { window: 3600, limit: 3 }, // 3 password reset requests per hour
  'email_verification': { window: 300, limit: 2 }, // 2 verification emails per 5 minutes
  
  // General API limits
  'api_general': { window: 60, limit: 100 },   // 100 requests per minute
  'api_upload': { window: 60, limit: 10 },     // 10 uploads per minute
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, email, etc.)
 * @param action - Type of action being rate limited
 * @returns Object with remaining attempts and whether limit is exceeded
 */
export async function checkRateLimit(
  identifier: string,
  action: keyof typeof rateLimitConfigs
): Promise<{
  success: boolean
  remaining: number
  resetTime: number
  limit: number
}> {
  const config = rateLimitConfigs[action]
  if (!config) {
    throw new Error(`Unknown rate limit action: ${action}`)
  }

  const key = `ratelimit:${action}:${identifier}`
  const now = Math.floor(Date.now() / 1000)
  const window = config.window

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline()
    
    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, now - window)
    
    // Count current entries (before adding new one)
    pipeline.zcard(key)
    
    const results = await pipeline.exec()
    
    // Check for pipeline errors
    if (!results || results.some(result => result[0] !== null)) {
      throw new Error('Redis pipeline operation failed')
    }
    
    const currentCount = results[1][1] as number

    // Check if we're over the limit before adding
    if (currentCount >= config.limit) {
      const resetTime = now + window
      return {
        success: false,
        remaining: 0,
        resetTime,
        limit: config.limit,
      }
    }

    // Add current request only if within limit
    const addPipeline = redis.pipeline()
    addPipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })
    addPipeline.expire(key, window)
    await addPipeline.exec()

    const resetTime = now + window
    const remaining = Math.max(0, config.limit - currentCount - 1)

    return {
      success: true,
      remaining,
      resetTime,
      limit: config.limit,
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open - allow the request if Redis is down
    // In production, you might want to fail closed for critical operations
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime: now + window,
      limit: config.limit,
    }
  }
}

/**
 * Reset rate limit for a specific identifier and action
 */
export async function resetRateLimit(
  identifier: string,
  action: keyof typeof rateLimitConfigs
): Promise<void> {
  const key = `ratelimit:${action}:${identifier}`
  
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Error resetting rate limit:', error)
  }
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  action: keyof typeof rateLimitConfigs
): Promise<{
  remaining: number
  resetTime: number
  limit: number
}> {
  const config = rateLimitConfigs[action]
  if (!config) {
    throw new Error(`Unknown rate limit action: ${action}`)
  }

  const key = `ratelimit:${action}:${identifier}`
  const now = Math.floor(Date.now() / 1000)
  const window = config.window

  try {
    // Remove expired entries and count
    await redis.zremrangebyscore(key, 0, now - window)
    const currentCount = await redis.zcard(key)

    const resetTime = now + window
    const remaining = Math.max(0, config.limit - currentCount)

    return {
      remaining,
      resetTime,
      limit: config.limit,
    }
  } catch (error) {
    console.error('Rate limiting status error:', error)
    return {
      remaining: config.limit,
      resetTime: now + window,
      limit: config.limit,
    }
  }
}

/**
 * Middleware helper to get client identifier for rate limiting
 */
export function getClientIdentifier(
  ip: string | undefined,
  userId?: number,
  email?: string
): string {
  // Use user ID if available, otherwise fall back to IP address
  if (userId) {
    return `user:${userId}`
  }
  
  if (email) {
    return `email:${email}`
  }
  
  if (ip) {
    return `ip:${ip}`
  }
  
  return 'unknown'
}

/**
 * Apply rate limiting to email operations
 */
export async function checkEmailRateLimit(
  email: string,
  operation: 'password_reset' | 'email_verification'
): Promise<{
  allowed: boolean
  remaining: number
  resetTime: number
}> {
  const result = await checkRateLimit(email, operation)
  
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetTime: result.resetTime,
  }
}