export const siteConfig = {
  title: 'Professional Photography Portfolio',
  description: 'Theo Middleton - Professional photographer specializing in portrait, landscape, and event photography. Discover stunning visual storytelling through expert composition and lighting.',
  storeName: 'Theo Middleton Photography Store',
  ownerName: 'Theo Middleton',
  imageBucketUrl: 'https://img.theomiddleton.me',
  blogBucketUrl: 'https://blog-img.theomiddleton.me',
  aboutBucketUrl: 'https://about-img.theomiddleton.me',
  customBucketUrl: 'https://custom-img.theomiddleton.me',
  streamBucketUrl: 'https://stream-files.theomiddleton.me',
  filesBucketUrl: 'https://files.theomiddleton.me',
  url: 'https://theoo.ooo',
  altUrl: 'https://theomiddleton.me',
  links: {
    github: '',
    website: 'https://theoo.ooo',
    instagram: 'https://www.instagram.com/theomiddleton_/',
    twitter: '',
    facebook: '',
  },
  headers: {
    main: '',
  },
  seo: {
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: 'Theo Middleton Photography Portfolio',
      images: [
        {
          url: 'https://files.theomiddleton.me/og-images/2-boats.jpg',
          width: 1200,
          height: 630,
          alt: 'Theo Middleton Photography - Professional photographer portfolio showcasing landscape and portrait work',
        },
      ],
    },
    keywords: {
      primary: ['photographer', 'photography portfolio', 'professional photography', 'Theo Middleton'],
      secondary: ['portrait photography', 'landscape photography', 'event photography', 'photo prints', 'visual storytelling'],
      local: ['photographer near me', 'local photographer', 'photography services']
    },
  },
  emails: {
    order: 'orders@email.theoo.ooo',
    support: 'support@theoo.ooo',
    replyTo: 'reply@theoo.ooo',
    noReply: 'noreply@email.theoo.ooo',
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
}
export type SiteConfig = typeof siteConfig
