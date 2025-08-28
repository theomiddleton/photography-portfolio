/**
 * Comprehensive SEO Configuration
 *
 * This configuration provides a centralized, customizable approach to SEO
 * without hardcoded keywords or data. All values can be easily modified
 * to adapt to different photographers, content types, and markets.
 */

// Global keyword pools for different content types
export const seoKeywords = {
  // Core photography keywords
  photography: [
    'photography',
    'photographer',
    'photos',
    'images',
    'art',
    'visual art',
    'landscape photography',
    'travel photography',
  ],

  // Genre-specific keywords
  genres: [
    'landscape',
    'street photography',
    'documentary',
    'nature',
    'urban',
    'black and white',
    'film photography',
  ],

  // Technical keywords
  technical: [
    'high resolution',
    'digital art',
    'print quality',
    'professional grade',
    'archival quality',
  ],

  // Store/product keywords
  store: [
    'photography print',
    'wall art',
    'home decor',
    'art print',
    'gallery quality',
    'museum quality',
    'canvas print',
    'framed print',
    'photographic art',
  ],

  // Blog/content keywords
  content: [
    'photography tips',
    'behind the scenes',
    'photography tutorial',
    'creative process',
    'photo story',
    'personal blog',
    'photography blog',
    'visual narrative',
  ],

  // Location-based (can be customized per user)
  locations: [
    'on location',
    'travel photography',
    'local photographer',
    'destination photography',
  ],
}

// SEO defaults and templates
export const seoDefaults = {
  // Global meta defaults
  meta: {
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#000000',
  },

  // OpenGraph defaults
  openGraph: {
    type: 'website',
    locale: 'en_US',
    card: 'summary_large_image',
  },

  // Default image dimensions
  images: {
    openGraph: {
      width: 1200,
      height: 630,
    },
    twitter: {
      width: 1200,
      height: 630,
    },
  },
}

// Page-specific SEO configurations
export const pageConfigs = {
  home: {
    titleTemplate: '%s | %s', // ownerName | title
    descriptionTemplate: '%s - %s', // description | ownerName photography
    keywords: [
      ...seoKeywords.photography.slice(0, 4),
      ...seoKeywords.genres.slice(0, 3),
    ],
    priority: 1.0,
    changeFreq: 'weekly' as const,
  },

  about: {
    titleTemplate: 'About %s | %s', // About ownerName | title
    descriptionTemplate: 'Learn about %s, %s', // ownerName, profession
    keywords: [
      ...seoKeywords.photography.slice(0, 3),
      'about',
      'bio',
      'photographer',
    ],
    priority: 0.9,
    changeFreq: 'monthly' as const,
  },

  blog: {
    titleTemplate: '%s | Blog', // title | Blog
    descriptionTemplate: '%s - Blog', // ownerName
    keywords: [
      ...seoKeywords.content.slice(0, 4),
      ...seoKeywords.photography.slice(0, 2),
    ],
    priority: 0.8,
    changeFreq: 'daily' as const,
  },

  blogPost: {
    titleTemplate: '%s | %s Blog', // postTitle | ownerName
    descriptionTemplate: '%s', // post excerpt/description
    keywords: [
      ...seoKeywords.content.slice(0, 2),
      ...seoKeywords.photography.slice(0, 2),
    ],
    priority: 0.7,
    changeFreq: 'monthly' as const,
  },

  gallery: {
    titleTemplate: '%s Gallery | %s', // galleryName | ownerName
    descriptionTemplate: '%s photography gallery by %s', // galleryName | ownerName
    keywords: [
      ...seoKeywords.photography.slice(0, 3),
      'gallery',
      'collection',
      ...seoKeywords.genres.slice(0, 2),
    ],
    priority: 0.7,
    changeFreq: 'weekly' as const,
  },

  store: {
    titleTemplate: 'Print Store | %s', // ownerName
    descriptionTemplate: 'High-quality photography prints by %s', // ownerName
    keywords: [
      ...seoKeywords.store.slice(0, 6),
      ...seoKeywords.photography.slice(0, 2),
    ],
    priority: 0.8,
    changeFreq: 'weekly' as const,
  },

  product: {
    titleTemplate: '%s | Print Store', // productName
    descriptionTemplate: '%s - %s', // productName | productDescription or default
    keywords: [
      ...seoKeywords.store.slice(0, 4),
      ...seoKeywords.technical.slice(0, 2),
    ],
    priority: 0.6,
    changeFreq: 'monthly' as const,
  },

  video: {
    titleTemplate: '%s | %s Videos', // videoTitle | ownerName
    descriptionTemplate: '%s video by %s', // videoTitle | ownerName
    keywords: [
      'photography video',
      'behind the scenes',
      'film',
      'short film',
      ...seoKeywords.photography.slice(0, 2),
      ...seoKeywords.content.slice(0, 2),
    ],
    priority: 0.6,
    changeFreq: 'monthly' as const,
  },
}

// Schema.org structured data templates
export const structuredDataTemplates = {
  person: (config: {
    name: string
    url: string
    image: string
    sameAs: string[]
    jobTitle?: string
    description?: string
    address?: {
      addressLocality?: string
      addressRegion?: string
      addressCountry?: string
    }
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: config.name,
    url: config.url,
    image: config.image,
    sameAs: config.sameAs,
    jobTitle: config.jobTitle || 'Photographer',
    description: config.description,
    ...(config.address && { address: config.address }),
  }),

  website: (config: {
    name: string
    url: string
    description?: string
    searchUrl?: string
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    url: config.url,
    ...(config.description && { description: config.description }),
    ...(config.searchUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: config.searchUrl,
        'query-input': 'required name=search_term_string',
      },
    }),
  }),

  photographAction: (config: {
    name: string
    url: string
    image: string
    description: string
    creator: string
    dateCreated?: string
    keywords?: string[]
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Photograph',
    name: config.name,
    url: config.url,
    image: config.image,
    description: config.description,
    creator: {
      '@type': 'Person',
      name: config.creator,
    },
    ...(config.dateCreated && { dateCreated: config.dateCreated }),
    ...(config.keywords && { keywords: config.keywords }),
  }),

  product: (config: {
    name: string
    description: string
    image: string
    brand: string
    offers: {
      price: string
      currency: string
      availability: string
      url: string
    }
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: config.name,
    description: config.description,
    image: config.image,
    brand: {
      '@type': 'Brand',
      name: config.brand,
    },
    offers: {
      '@type': 'Offer',
      ...config.offers,
    },
  }),

  blogPosting: (config: {
    headline: string
    description: string
    image: string
    author: string
    datePublished: string
    dateModified?: string
    url: string
    keywords?: string[]
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: config.headline,
    description: config.description,
    image: config.image,
    author: {
      '@type': 'Person',
      name: config.author,
    },
    datePublished: config.datePublished,
    dateModified: config.dateModified || config.datePublished,
    url: config.url,
    ...(config.keywords && { keywords: config.keywords }),
  }),
}

// Utility functions for SEO generation
export const seoUtils = {
  // Generate keywords for a specific content type
  generateKeywords: (
    type: keyof typeof pageConfigs,
    customKeywords: string[] = [],
    maxKeywords: number = 10,
  ): string[] => {
    const baseKeywords = pageConfigs[type]?.keywords || []
    const allKeywords = [...baseKeywords, ...customKeywords]
    return allKeywords.slice(0, maxKeywords)
  },

  // Generate a meta description with fallback
  generateDescription: (
    template: string,
    variables: Record<string, string>,
    fallback: string = '',
  ): string => {
    let description = template
    Object.entries(variables).forEach(([key, value]) => {
      description = description.replace(new RegExp(`%${key}%`, 'g'), value)
    })
    return description || fallback
  },

  // Generate a title with template
  generateTitle: (
    template: string,
    variables: Record<string, string>,
  ): string => {
    let title = template
    Object.entries(variables).forEach(([key, value]) => {
      title = title.replace(new RegExp(`%${key}%`, 'g'), value)
    })
    return title
  },

  // Clean and optimize keywords
  cleanKeywords: (keywords: string[]): string[] => {
    return keywords
      .map((k) => k.toLowerCase().trim())
      .filter((k, i, arr) => k && arr.indexOf(k) === i) // Remove duplicates and empty
      .slice(0, 15) // Limit to 15 keywords max
  },
}

export type SeoConfig = typeof seoKeywords
export type PageConfig = typeof pageConfigs
export type StructuredDataTemplates = typeof structuredDataTemplates
