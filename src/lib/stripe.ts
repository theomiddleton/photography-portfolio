import Stripe from 'stripe'
import { isStoreEnabledServer } from '~/lib/store-utils'

/**
 * Creates a Stripe instance only when store is enabled and credentials are available
 * Returns null if store is disabled or credentials are missing
 */
function createStripeInstance(): Stripe | null {
  // Check if store is enabled first
  if (!isStoreEnabledServer()) {
    return null
  }
  
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return null
  }

  return new Stripe(secretKey, {
    typescript: true,
  })
}

// Lazy-loaded stripe instance
let _stripe: Stripe | null | undefined = undefined

/**
 * Get the Stripe instance, creating it if necessary
 * Returns null if store is disabled or credentials are missing
 */
export function getStripe(): Stripe | null {
  if (_stripe === undefined) {
    _stripe = createStripeInstance()
  }
  return _stripe
}

/**
 * Get the Stripe instance, throwing an error if not available
 * Use this when you expect Stripe to be available (after checking isStoreEnabledServer)
 */
export function requireStripe(): Stripe {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error('Stripe is not available. Make sure store is enabled and STRIPE_SECRET_KEY is set.')
  }
  return stripe
}

// For backward compatibility, export stripe but it will be null if not configured
export const stripe = getStripe()

