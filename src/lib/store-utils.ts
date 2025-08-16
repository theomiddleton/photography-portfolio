import { siteConfig } from '~/config/site'

/**
 * Checks if the store is enabled on the client side
 * Only checks siteConfig to avoid leaking environment variables
 */
export function isStoreEnabledClient(): boolean {
  return siteConfig.features.storeEnabled
}

/**
 * Checks if the store is enabled on the server side
 * Checks both siteConfig and required environment variables
 */
export function isStoreEnabledServer(): boolean {
  // First check if store is disabled in config
  if (!siteConfig.features.storeEnabled) {
    return false
  }

  // Check if required Stripe environment variables are present
  const hasStripeSecretKey = !!process.env.STRIPE_SECRET_KEY
  const hasStripeWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET
  const hasStripePublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  return hasStripeSecretKey && hasStripeWebhookSecret && hasStripePublishableKey
}