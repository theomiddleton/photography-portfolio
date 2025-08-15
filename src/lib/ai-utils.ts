import { siteConfig } from '~/config/site'
import { env } from '~/env.js'

/**
 * Check if AI features are available based on both site configuration and environment variables
 */
export function isAIAvailable(): boolean {
  return siteConfig.features.aiEnabled && !!env.GOOGLE_GENERATIVE_AI_API_KEY
}

/**
 * Get a human-readable reason why AI features are unavailable
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
