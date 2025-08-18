export const siteConfig = {
  title: 'Portfolio',
  description: 'Photography portfolio of Theo Middleton',
  storeName: 'T Middleton Store',
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
      siteName: 'Portfolio Project',
      images: [
        {
          url: 'https://files.theomiddleton.me/og-images/2-boats.jpg',
          width: 1200,
          height: 630,
          alt: 'Open Graph Image',
        },
      ],
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
