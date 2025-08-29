import type { Metadata } from 'next'
import { siteConfig } from '~/config/site'
import {
  seoKeywords,
  seoDefaults,
  pageConfigs,
  structuredDataTemplates,
  seoUtils,
} from '~/config/seo'

/**
 * SEO Metadata Generation Utilities
 *
 * These utilities generate dynamic, configurable SEO metadata
 * without hardcoded keywords or data.
 */

interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  type?: keyof typeof pageConfigs
  customTemplate?: {
    title?: string
    description?: string
  }
  openGraph?: {
    title?: string
    description?: string
    images?: {
      url: string
      width?: number
      height?: number
      alt?: string
    }[]
    type?: string
  }
  robots?: {
    index?: boolean
    follow?: boolean
  }
  canonicalUrl?: string
}

/**
 * Generate comprehensive metadata for a page
 */
export function generateSEOMetadata(config: SEOConfig): Metadata {
  const pageType = config.type || 'home'
  const pageConfig = pageConfigs[pageType]

  // Generate title  
  const title = config.title  
    ? (config.customTemplate?.title  
        ? seoUtils.generateTitle(config.customTemplate.title, {  
            title: config.title,  
            ownerName: siteConfig.ownerName,  
          })  
        : config.title)  
    : seoUtils.generateTitle(pageConfig.titleTemplate, {  
        ownerName: siteConfig.ownerName,  
        title: siteConfig.title,  
      })  

  // Generate description  
  const description =  
    config.description ||  
    seoUtils.generateDescription(  
      pageConfig.descriptionTemplate,  
      {  
        description: siteConfig.description,  
        ownerName: siteConfig.ownerName,  
        profession: siteConfig.seo.profession,  
      },  
      siteConfig.description,  
    )  

  // Generate keywords
  const keywords = seoUtils.cleanKeywords([
    ...(config.keywords || []),
    ...seoUtils.generateKeywords(pageType, [], 8),
  ])

  // Generate OpenGraph data
  const openGraphImages =
    config.openGraph?.images || siteConfig.seo.openGraph.images || []
  const openGraph = {
    ...seoDefaults.openGraph,
    title: config.openGraph?.title || title,
    description: config.openGraph?.description || description,
    url: siteConfig.url,
    siteName: `${siteConfig.ownerName} ${siteConfig.title}`,
    images: openGraphImages,
    type: config.openGraph?.type || seoDefaults.openGraph.type,
    locale: siteConfig.seo.openGraph.locale,
  }

  // Generate Twitter card data
  const twitter = {
    card: 'summary_large_image' as const,
    title: config.openGraph?.title || title,
    description: config.openGraph?.description || description,
    images: openGraphImages.map((img) => ('url' in img ? img.url : (img as any))),
    ...(siteConfig.seo.twitter.site && { site: siteConfig.seo.twitter.site }),
    ...(siteConfig.seo.twitter.creator && {
      creator: siteConfig.seo.twitter.creator,
    }),
  }

  // Generate robots configuration
  const robots = {
    index: seoDefaults.meta.robots.index,
    follow: seoDefaults.meta.robots.follow,
    googleBot: {
      index: seoDefaults.meta.robots.googleBot.index,
      follow: seoDefaults.meta.robots.googleBot.follow,
      'max-video-preview':
        seoDefaults.meta.robots.googleBot['max-video-preview'],
      'max-image-preview': 'large' as const,
      'max-snippet': seoDefaults.meta.robots.googleBot['max-snippet'],
    },
    ...(config.robots && config.robots),
  }

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: siteConfig.seo.meta.author || siteConfig.ownerName }],
    openGraph,
    twitter,
    robots,
    ...(config.canonicalUrl && {
      alternates: {
        canonical: config.canonicalUrl,
      },
    }),
    ...(siteConfig.seo.meta.themeColor && {
      themeColor: siteConfig.seo.meta.themeColor,
    }),
    viewport: seoDefaults.meta.viewport,
  }
}

/**
 * Generate structured data for different content types
 */
export function generateStructuredData(
  type: 'person' | 'website' | 'photograph' | 'product' | 'blogPost',
  data: any,
) {
  switch (type) {
    case 'person':
      return structuredDataTemplates.person({
        name: siteConfig.ownerName,
        url: siteConfig.url,
        image: siteConfig.seo.openGraph.images[0].url,
        sameAs: Object.values(siteConfig.links).filter(Boolean),
        jobTitle: siteConfig.seo.jobTitle,
        description: siteConfig.description,
        ...(siteConfig.seo.location.locality && {
          address: {
            addressLocality: siteConfig.seo.location.locality,
            addressRegion: siteConfig.seo.location.region,
            addressCountry: siteConfig.seo.location.country,
          },
        }),
        ...data,
      })

    case 'website':
      return structuredDataTemplates.website({
        name: `${siteConfig.ownerName} ${siteConfig.title}`,
        url: siteConfig.url,
        description: siteConfig.description,
        searchUrl: `${siteConfig.url}/search?q={search_term_string}`,
        ...data,
      })

    case 'photograph':
      return structuredDataTemplates.photographAction({
        creator: siteConfig.ownerName,
        ...data,
      })

    case 'product':
      return structuredDataTemplates.product({
        brand: siteConfig.storeName,
        ...data,
      })

    case 'blogPost':
      return structuredDataTemplates.blogPosting({
        author: siteConfig.ownerName,
        ...data,
      })

    default:
      return null
  }
}

/**
 * Generate OG image URL with parameters
 */
export function generateOGImageUrl(params: {
  title?: string
  image?: string
  type?: string
}): string {
  const ogImageUrl = new URL(
    '/api/og',
    siteConfig.url || 'http://localhost:3000',
  )

  if (params.title) {
    ogImageUrl.searchParams.set('title', params.title)
  }
  if (params.image) {
    ogImageUrl.searchParams.set('image', params.image)
  }
  if (params.type) {
    ogImageUrl.searchParams.set('type', params.type)
  }

  return ogImageUrl.toString()
}

/**
 * Generate keyword-rich content descriptions
 */
export function generateKeywordDescription(
  content: string,
  contentType: keyof typeof seoKeywords,
  maxLength: number = 160,
): string {
  const relevantKeywords = seoKeywords[contentType]?.slice(0, 3) || []
  const keywordPhrase = relevantKeywords.join(', ')

  // Try to naturally incorporate keywords into description
  let description = content
  if (description.length < maxLength - keywordPhrase.length - 10) {
    description += ` Featuring ${keywordPhrase}.`
  }

  // Truncate if too long
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...'
  }

  return description
}

/**
 * Get page-specific SEO configuration
 */
export function getPageSEOConfig(pageType: keyof typeof pageConfigs) {
  return pageConfigs[pageType]
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbData(
  breadcrumbs: {
    name: string
    url: string
  }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}
