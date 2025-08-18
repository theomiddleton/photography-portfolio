// Simple in-memory rate limiter for API protection
// In production, consider using Redis or similar for distributed rate limiting

interface RateLimitEntry {
  count: number
  resetTime: number
}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export function rateLimit(config: RateLimitConfig) {
  const store = new Map<string, RateLimitEntry>()

  return {
    check: (
      identifier: string,
    ): { success: boolean; reset: number; remaining: number } => {
      const now = Date.now()
      const entry = store.get(identifier)

      // Clean up expired entries
      if (entry && now > entry.resetTime) {
        store.delete(identifier)
      }

      const currentEntry = store.get(identifier) || {
        count: 0,
        resetTime: now + config.windowMs,
      }

      if (currentEntry.count >= config.maxRequests) {
        return {
          success: false,
          reset: currentEntry.resetTime,
          remaining: 0,
        }
      }

      currentEntry.count++
      store.set(identifier, currentEntry)

      return {
        success: true,
        reset: currentEntry.resetTime,
        remaining: config.maxRequests - currentEntry.count,
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
