import { siteConfig } from '~/config/site'

// Security configuration for the application
export const securityConfig = {
  // Password requirements
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    bcryptRounds: 12
  },
  
  // JWT configuration
  jwt: {
    minSecretLength: 32,
    defaultExpirationHours: 168, // 1 week (reduced from 30 days)
    algorithm: 'HS256' as const
  },
  
  // Session configuration
  session: {
    cookieName: 'session',
    httpOnly: true,
    secure: true, // Always secure in production
    sameSite: 'strict' as const,
    path: '/'
  },
  
  // Rate limiting configuration
  rateLimiting: {
    failClosedEndpoints: ['passwordAttempt', 'email', 'upload'],
    failOpenEndpoints: ['webhook', 'revalidate'],
    adminMultiplier: 3
  },
  
  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      font-src 'self' data:;
      connect-src 'self' https://api.stripe.com https://*.r2.cloudflarestorage.com ${siteConfig.imageBucketUrl} ${siteConfig.blogBucketUrl} ${siteConfig.aboutBucketUrl} ${siteConfig.customBucketUrl} ${siteConfig.streamBucketUrl} ${siteConfig.filesBucketUrl} ${siteConfig.bucketsUrl};
      frame-src https://js.stripe.com;
    `.replace(/\s+/g, ' ').trim()
  },
  
  // Input validation
  validation: {
    emailMaxLength: 255,
    nameMaxLength: 100,
    passwordMaxLength: 128,
    userAgentMaxLength: 100
  },
  
  // Security logging
  logging: {
    maskEmails: true,
    maskIPs: true,
    truncateUserAgent: true,
    maxDetailLength: 200
  },
  
  // Account security
  account: {
    maxFailedAttempts: 5,
    lockoutDurationMinutes: 15,
    requireEmailVerification: true, // Enable email verification
    passwordChangeInvalidatesSessions: true
  }
} as const

export type SecurityConfig = typeof securityConfig