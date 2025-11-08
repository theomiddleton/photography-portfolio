import { getEnv } from './env-utils'

// Default configuration with generic placeholder data - same as in use-site-config.ts
const defaultConfig = {
  title: 'Photography Portfolio',
  description: 'Professional photography portfolio and online store',
  logo: {
    type: 'text', // 'text' | 'image' | 'icon'
    text: '', // Initials or short text (e.g., 'TM', 'Photo')
    imageUrl: '', // URL to logo image when type is 'image'
    alt: 'Site Logo',
  },
  storeName: 'Photography Store',
  ownerName: 'Photographer Name',
  imageBucketUrl: 'https://your-domain.com/images',
  blogBucketUrl: 'https://your-domain.com/blog-images',
  aboutBucketUrl: 'https://your-domain.com/about-images',
  customBucketUrl: 'https://your-domain.com/custom-images',
  streamBucketUrl: 'https://your-domain.com/stream-files',
  filesBucketUrl: 'https://your-domain.com/files',
  bucketsUrl: 'https://your-domain.com/buckets',
  url: 'https://your-domain.com',
  altUrl: 'https://your-alt-domain.com',
  imageDomain: 'your-domain.com', // Domain pattern for Next.js image optimization
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
    security: {
      allowDangerousFiles: false, // When true, bypasses dangerous file type restrictions
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
  uploadLimits: {
    // Upload size limits in MB for different buckets
    image: 20, // Main gallery images
    blog: 5, // Blog editor images  
    about: 20, // About page images
    custom: 20, // Custom bucket images
    files: 20, // General file uploads
  },
  configLocation: 'Default',
}

/**
 * Get server-safe site configuration for metadata generation and server components
 * This function ensures consistent configuration between server and client
 */
export function getServerSiteConfig() {
  // During build time and server-side rendering, create config with environment variables
  const configLocation = getEnv('NEXT_PUBLIC_CONFIG_LOCATION', defaultConfig.configLocation)
  
  // Log configuration location during build for debugging
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV) {
    console.log(`🔧 Site Configuration loaded from: ${configLocation}`)
  }
  return {
    title: getEnv('NEXT_PUBLIC_SITE_TITLE', defaultConfig.title),
    description: getEnv('NEXT_PUBLIC_SITE_DESCRIPTION', defaultConfig.description),
    logo: {
      type: getEnv('NEXT_PUBLIC_LOGO_TYPE', defaultConfig.logo.type),
      text: getEnv('NEXT_PUBLIC_LOGO_TEXT', defaultConfig.logo.text),
      imageUrl: getEnv('NEXT_PUBLIC_LOGO_IMAGE_URL', defaultConfig.logo.imageUrl),
      alt: getEnv('NEXT_PUBLIC_LOGO_ALT', defaultConfig.logo.alt),
    },
    storeName: getEnv('NEXT_PUBLIC_STORE_NAME', defaultConfig.storeName),
    ownerName: getEnv('NEXT_PUBLIC_OWNER_NAME', defaultConfig.ownerName),
    imageBucketUrl: getEnv('NEXT_PUBLIC_IMAGE_BUCKET_URL', defaultConfig.imageBucketUrl),
    blogBucketUrl: getEnv('NEXT_PUBLIC_BLOG_BUCKET_URL', defaultConfig.blogBucketUrl),
    aboutBucketUrl: getEnv('NEXT_PUBLIC_ABOUT_BUCKET_URL', defaultConfig.aboutBucketUrl),
    customBucketUrl: getEnv('NEXT_PUBLIC_CUSTOM_BUCKET_URL', defaultConfig.customBucketUrl),
    streamBucketUrl: getEnv('NEXT_PUBLIC_STREAM_BUCKET_URL', defaultConfig.streamBucketUrl),
    filesBucketUrl: getEnv('NEXT_PUBLIC_FILES_BUCKET_URL', defaultConfig.filesBucketUrl),
    bucketsUrl: getEnv('NEXT_PUBLIC_BUCKETS_URL', defaultConfig.bucketsUrl),
    url: getEnv('NEXT_PUBLIC_SITE_URL', defaultConfig.url),
    altUrl: getEnv('NEXT_PUBLIC_ALT_URL', defaultConfig.altUrl),
    imageDomain: getEnv('NEXT_PUBLIC_IMAGE_DOMAIN', defaultConfig.imageDomain),
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
      security: {
        allowDangerousFiles: getEnv('NEXT_PUBLIC_ALLOW_DANGEROUS_FILES', defaultConfig.features.security.allowDangerousFiles),
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
    uploadLimits: {
      // Upload size limits in MB for different buckets
      image: getEnv('NEXT_PUBLIC_UPLOAD_LIMIT_IMAGE', defaultConfig.uploadLimits.image),
      blog: getEnv('NEXT_PUBLIC_UPLOAD_LIMIT_BLOG', defaultConfig.uploadLimits.blog),
      about: getEnv('NEXT_PUBLIC_UPLOAD_LIMIT_ABOUT', defaultConfig.uploadLimits.about),
      custom: getEnv('NEXT_PUBLIC_UPLOAD_LIMIT_CUSTOM', defaultConfig.uploadLimits.custom),
      files: getEnv('NEXT_PUBLIC_UPLOAD_LIMIT_FILES', defaultConfig.uploadLimits.files),
    },
    configLocation,
  }
}

export type SiteConfig = ReturnType<typeof getServerSiteConfig>

/**
 * Detect if the site configuration is using default/placeholder values
 * This helps determine if the site owner has customized their configuration
 */
export function isDefaultSiteConfig(config: SiteConfig = siteConfig): boolean {
  // Check for default placeholder values that indicate uncustomized config
  const defaultIndicators = [
    config.title === defaultConfig.title,
    config.ownerName === defaultConfig.ownerName,
    config.url === defaultConfig.url,
    config.imageBucketUrl === defaultConfig.imageBucketUrl,
    config.bucketsUrl === defaultConfig.bucketsUrl,
    config.configLocation === 'Default',
    config.url.includes('your-domain.com'),
    config.imageBucketUrl.includes('your-domain.com'),
    config.emails.order.includes('your-domain.com'),
    config.emails.support.includes('your-domain.com'),
  ]
  
  // If any of these default indicators are true, config likely hasn't been customized
  return defaultIndicators.some(indicator => indicator)
}

// Export default config for fallback scenarios
export { defaultConfig }

// Main site configuration - use this for server components and metadata generation
export const siteConfig = getServerSiteConfig()
