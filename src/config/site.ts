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
    // Professional information
    profession: {
      title: 'Professional Photographer',
      specialties: ['portrait', 'landscape', 'event'],
      services: ['Photography Services', 'Photo Prints', 'Visual Storytelling', 'Fine Art Photography'],
      businessType: 'Photography Services',
      areaServed: 'United Kingdom',
      priceRange: '$$'
    },
    
    // SEO text templates - use {ownerName}, {profession}, {specialties}, etc.
    templates: {
      description: {
        main: '{ownerName} - {profession} specializing in {specialties} photography. Discover stunning visual storytelling through expert composition and lighting.',
        portfolio: 'Discover the stunning photography portfolio of {ownerName}. {profession} specializing in {specialties}. Browse gallery and contact for photography services.',
        about: 'Learn about {ownerName}, a {profession} specializing in {specialties} photography. Discover the story behind the lens.',
        aboutFallback: 'Learn about {ownerName}, a {profession} with expertise in {specialties} photography.',
        blog: 'Read the latest photography blog posts by {ownerName}. Discover photography tips, behind-the-scenes stories, gear reviews, and artistic insights from a {profession}.',
        blogExplore: 'Explore photography insights, tips, and stories from {profession} {ownerName}.',
        blogPost: 'Read this photography blog post by {ownerName}. Discover insights, tips, and stories from a {profession}.',
        store: 'Shop high-quality photography prints and fine art by {ownerName}. Professional {specialties} photography available as premium prints for your home or office.',
        photo: 'Professional photograph by {ownerName} - {profession} specializing in {specialties} photography.',
        services: 'Professional photography services specializing in {specialties}'
      },
      title: {
        main: '{ownerName} | {profession} Portfolio',
        about: 'About {ownerName} | {profession}',
        aboutWithTitle: '{title} | {ownerName} Photography',
        blog: 'Photography Blog | {ownerName}',
        blogPost: '{postTitle} | {ownerName} Photography Blog',
        store: 'Photography Prints & Art | {ownerName} Store',
        photo: '{photoName} | {ownerName} Photography'
      }
    },
    
    // Keywords
    keywords: {
      primary: ['photographer', 'photography portfolio', 'professional photography', '{ownerName}'],
      secondary: ['{specialties} photography', 'photo prints', 'visual storytelling'],
      local: ['photographer near me', 'local photographer', 'photography services'],
      bio: ['photographer bio', 'photographer background', 'photography experience', 'photographer story', 'creative vision'],
      blog: ['photography blog', 'photography tips', 'photography insights', 'behind the scenes', 'photography tutorials'],
      store: ['photography prints', 'fine art prints', 'wall art', 'photo gallery', 'art prints'],
      photo: ['professional photography', 'artistic photography', 'fine art photography']
    },
    
    // OpenGraph configuration
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: '{ownerName} Photography Portfolio',
      images: [
        {
          url: 'https://files.theomiddleton.me/og-images/2-boats.jpg',
          width: 1200,
          height: 630,
          alt: '{ownerName} Photography - {profession} portfolio showcasing {specialties} work',
        },
      ],
    },
    
    // Structured data configuration
    structuredData: {
      person: {
        jobTitle: '{profession}',
        knowsAbout: [
          'Photography',
          '{specialties} Photography',
          'Photo Editing',
          'Visual Arts',
          'Digital Photography',
          'Commercial Photography'
        ]
      },
      business: {
        serviceType: '{businessType}',
        description: '{description}',
        offers: [
          {
            name: '{specialties} Photography',
            description: 'Professional {specialties} photography for individuals, couples, and families'
          },
          {
            name: 'Photography Prints',
            description: 'High-quality prints of professional photographs available for purchase'
          }
        ]
      }
    }
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
