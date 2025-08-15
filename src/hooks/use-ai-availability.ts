'use client'

import { isAIEnabledClient } from '~/lib/ai-utils'

/**
 * Simple hook that returns whether AI features are enabled in the site configuration
 * This is determined at build time and doesn't require API calls
 */
export function useAIAvailability(): boolean {
  return isAIEnabledClient()
}
