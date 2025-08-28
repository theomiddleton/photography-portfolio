'use client'

import { useState, useEffect } from 'react'
import { getEnv } from '~/lib/env-utils'

// Default configuration with generic placeholder data
const defaultConfig = {
  title: 'Photography Portfolio',
  description: 'Professional photography portfolio and online store',
  storeName: 'Photography Store',
  ownerName: 'Photographer Name',
  imageBucketUrl: 'https://your-domain.com/images',
  blogBucketUrl: 'https://your-domain.com/blog-images',
  aboutBucketUrl: 'https://your-domain.com/about-images',
  customBucketUrl: 'https://your-domain.com/custom-images',
  streamBucketUrl: 'https://your-domain.com/stream-files',
  filesBucketUrl: 'https://your-domain.com/files',
  url: 'https://your-domain.com',
  altUrl: 'https://your-alt-domain.com',
  links: {
    github: '',
    website: 'https://your-domain.com',
    instagram: '',
    twitter: '',
    facebook: '',
  },
  headers: {
    main: '',
  },
  // Enhanced SEO Configuration
  seo: {
    // Basic SEO settings
    jobTitle: 'Photographer', // Configurable job title
    profession: 'professional photographer', // Used in descriptions
    location: {
      // Optional location information for local SEO
      locality: '', // e.g., 'London'
      region: '', // e.g., 'England'
      country: 'US', // ISO country code
    },
    // OpenGraph configuration
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: 'Photography Portfolio',
      images: [
        {
          url: 'https://your-domain.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Photography Portfolio',
        },
      ],
    },
    // Twitter card configuration
    twitter: {
      site: '', // @username
      creator: '', // @username
    },
    // Additional meta tags
    meta: {
      keywords: [], // Will be populated dynamically per page
      author: 'Photographer Name',
      themeColor: '#000000',
    },
  },
  emails: {
    order: 'orders@your-domain.com',
    support: 'support@your-domain.com',
    replyTo: 'reply@your-domain.com',
    noReply: 'noreply@your-domain.com',
  },
  features: {
    aiEnabled: true,
    storeEnabled: true,
    store: {
      reviewsEnabled: false,
      showTax: false, // When true, shows tax separately. When false, includes tax in price
    },
  },
  rateLimiting: {
    // Base rate limits (requests per minute)
    limits: {
      upload: 10, // File uploads (resource intensive)
      imageProcessing: 20, // Image processing operations
      aiGeneration: 5, // AI generation requests (expensive)
      passwordAttempt: 10, // Password attempts
      email: 5, // Email sending
      webhook: 100, // Webhook processing (generous for Stripe)
      checkout: 10, // Checkout attempts
      revalidate: 20, // Cache revalidation
    },
    // Admin multiplier - admins get 3x the base limits
    adminMultiplier: 3,
  },
  configLocation: 'Default',
}

export type SiteConfig = typeof defaultConfig

/**
 * Create site configuration with environment variable overrides
 * This function is called client-side to ensure environment variables are available
 */
function createSiteConfig(): SiteConfig {
  return {
    title: getEnv('NEXT_PUBLIC_SITE_TITLE', defaultConfig.title),
    description: getEnv('NEXT_PUBLIC_SITE_DESCRIPTION', defaultConfig.description),
    storeName: getEnv('NEXT_PUBLIC_STORE_NAME', defaultConfig.storeName),
    ownerName: getEnv('NEXT_PUBLIC_OWNER_NAME', defaultConfig.ownerName),
    imageBucketUrl: getEnv('NEXT_PUBLIC_IMAGE_BUCKET_URL', defaultConfig.imageBucketUrl),
    blogBucketUrl: getEnv('NEXT_PUBLIC_BLOG_BUCKET_URL', defaultConfig.blogBucketUrl),
    aboutBucketUrl: getEnv('NEXT_PUBLIC_ABOUT_BUCKET_URL', defaultConfig.aboutBucketUrl),
    customBucketUrl: getEnv('NEXT_PUBLIC_CUSTOM_BUCKET_URL', defaultConfig.customBucketUrl),
    streamBucketUrl: getEnv('NEXT_PUBLIC_STREAM_BUCKET_URL', defaultConfig.streamBucketUrl),
    filesBucketUrl: getEnv('NEXT_PUBLIC_FILES_BUCKET_URL', defaultConfig.filesBucketUrl),
    url: getEnv('NEXT_PUBLIC_SITE_URL', defaultConfig.url),
    altUrl: getEnv('NEXT_PUBLIC_ALT_URL', defaultConfig.altUrl),
    links: {
      github: getEnv('NEXT_PUBLIC_GITHUB_URL', defaultConfig.links.github),
      website: getEnv('NEXT_PUBLIC_WEBSITE_URL', defaultConfig.links.website),
      instagram: getEnv('NEXT_PUBLIC_INSTAGRAM_URL', defaultConfig.links.instagram),
      twitter: getEnv('NEXT_PUBLIC_TWITTER_URL', defaultConfig.links.twitter),
      facebook: getEnv('NEXT_PUBLIC_FACEBOOK_URL', defaultConfig.links.facebook),
    },
    headers: {
      main: getEnv('NEXT_PUBLIC_MAIN_HEADER', defaultConfig.headers.main),
    },
    // Enhanced SEO Configuration
    seo: {
      // Basic SEO settings
      jobTitle: getEnv('NEXT_PUBLIC_SEO_JOB_TITLE', defaultConfig.seo.jobTitle),
      profession: getEnv('NEXT_PUBLIC_SEO_PROFESSION', defaultConfig.seo.profession),
      location: {
        locality: getEnv('NEXT_PUBLIC_SEO_LOCALITY', defaultConfig.seo.location.locality),
        region: getEnv('NEXT_PUBLIC_SEO_REGION', defaultConfig.seo.location.region),
        country: getEnv('NEXT_PUBLIC_SEO_COUNTRY', defaultConfig.seo.location.country),
      },
      // OpenGraph configuration
      openGraph: {
        type: 'website',
        locale: getEnv('NEXT_PUBLIC_OG_LOCALE', defaultConfig.seo.openGraph.locale),
        siteName: getEnv('NEXT_PUBLIC_OG_SITE_NAME', defaultConfig.seo.openGraph.siteName),
        images: [
          {
            url: getEnv('NEXT_PUBLIC_OG_IMAGE_URL', defaultConfig.seo.openGraph.images[0].url),
            width: getEnv('NEXT_PUBLIC_OG_IMAGE_WIDTH', defaultConfig.seo.openGraph.images[0].width),
            height: getEnv('NEXT_PUBLIC_OG_IMAGE_HEIGHT', defaultConfig.seo.openGraph.images[0].height),
            alt: getEnv('NEXT_PUBLIC_OG_IMAGE_ALT', defaultConfig.seo.openGraph.images[0].alt),
          },
        ],
      },
      // Twitter card configuration
      twitter: {
        site: getEnv('NEXT_PUBLIC_TWITTER_SITE', defaultConfig.seo.twitter.site),
        creator: getEnv('NEXT_PUBLIC_TWITTER_CREATOR', defaultConfig.seo.twitter.creator),
      },
      // Additional meta tags
      meta: {
        keywords: [], // Will be populated dynamically per page
        author: getEnv('NEXT_PUBLIC_META_AUTHOR', defaultConfig.seo.meta.author),
        themeColor: getEnv('NEXT_PUBLIC_THEME_COLOR', defaultConfig.seo.meta.themeColor),
      },
    },
    emails: {
      order: getEnv('NEXT_PUBLIC_ORDER_EMAIL', defaultConfig.emails.order),
      support: getEnv('NEXT_PUBLIC_SUPPORT_EMAIL', defaultConfig.emails.support),
      replyTo: getEnv('NEXT_PUBLIC_REPLY_TO_EMAIL', defaultConfig.emails.replyTo),
      noReply: getEnv('NEXT_PUBLIC_NO_REPLY_EMAIL', defaultConfig.emails.noReply),
    },
    features: {
      aiEnabled: getEnv('NEXT_PUBLIC_AI_ENABLED', defaultConfig.features.aiEnabled),
      storeEnabled: getEnv('NEXT_PUBLIC_STORE_ENABLED', defaultConfig.features.storeEnabled),
      store: {
        reviewsEnabled: getEnv('NEXT_PUBLIC_REVIEWS_ENABLED', defaultConfig.features.store.reviewsEnabled),
        showTax: getEnv('NEXT_PUBLIC_SHOW_TAX', defaultConfig.features.store.showTax),
      },
    },
    rateLimiting: {
      // Base rate limits (requests per minute)
      limits: {
        upload: getEnv('NEXT_PUBLIC_RATE_LIMIT_UPLOAD', defaultConfig.rateLimiting.limits.upload),
        imageProcessing: getEnv('NEXT_PUBLIC_RATE_LIMIT_IMAGE_PROCESSING', defaultConfig.rateLimiting.limits.imageProcessing),
        aiGeneration: getEnv('NEXT_PUBLIC_RATE_LIMIT_AI_GENERATION', defaultConfig.rateLimiting.limits.aiGeneration),
        passwordAttempt: getEnv('NEXT_PUBLIC_RATE_LIMIT_PASSWORD_ATTEMPT', defaultConfig.rateLimiting.limits.passwordAttempt),
        email: getEnv('NEXT_PUBLIC_RATE_LIMIT_EMAIL', defaultConfig.rateLimiting.limits.email),
        webhook: getEnv('NEXT_PUBLIC_RATE_LIMIT_WEBHOOK', defaultConfig.rateLimiting.limits.webhook),
        checkout: getEnv('NEXT_PUBLIC_RATE_LIMIT_CHECKOUT', defaultConfig.rateLimiting.limits.checkout),
        revalidate: getEnv('NEXT_PUBLIC_RATE_LIMIT_REVALIDATE', defaultConfig.rateLimiting.limits.revalidate),
      },
      // Admin multiplier - admins get 3x the base limits
      adminMultiplier: getEnv('NEXT_PUBLIC_ADMIN_MULTIPLIER', defaultConfig.rateLimiting.adminMultiplier),
    },
    configLocation: getEnv('NEXT_PUBLIC_CONFIG_LOCATION', defaultConfig.configLocation),
  }
}

/**
 * Custom hook to handle site configuration with proper hydration
 * Returns default values during initial render and updates after hydration
 */
export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState(() => defaultConfig)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // After hydration, create config with environment variables
    setConfig(createSiteConfig())
    setIsHydrated(true)
  }, [])

  return config
}

/**
 * Hook to check if the component has been hydrated
 */
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Export default config for non-client components that need consistent values
 */
export { defaultConfig }