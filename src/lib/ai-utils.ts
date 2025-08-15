import { siteConfig } from '~/config/site'
import { env } from '~/env.js'

/**
 * Server-side: Check if AI features are available based on both site configuration and environment variables
 * Only use this on the server side (API routes, server components)
 */
export function isAIAvailable(): boolean {
  return siteConfig.features.aiEnabled && !!env.GOOGLE_GENERATIVE_AI_API_KEY
}

/**
 * Server-side: Get a human-readable reason why AI features are unavailable
 * Only use this on the server side (API routes, server components)
 */
export function getAIUnavailableReason(): string {
  if (!siteConfig.features.aiEnabled) {
    return 'AI features are disabled in site configuration'
  }
  if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return 'AI API key not configured'
  }
  return 'AI features are available'
}

/**
 * Client-side: Check if AI features are enabled in site configuration
 * Use this in client components - only checks if AI is enabled in config, not API key availability
 */
export function isAIEnabledClient(): boolean {
  return siteConfig.features.aiEnabled
}
