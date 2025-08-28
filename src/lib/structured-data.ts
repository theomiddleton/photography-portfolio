import type { Product, ProductSize } from '~/server/db/schema'
import { siteConfig } from '~/config/site'

interface ProductStructuredDataProps {
  product: Product
  sizes: ProductSize[]
  baseUrl: string
}

export function generateProductStructuredData({ 
  product, 
  sizes, 
  baseUrl 
}: ProductStructuredDataProps) {
  const lowestPrice = Math.min(...sizes.map(size => size.basePrice))
  const highestPrice = Math.max(...sizes.map(size => size.basePrice))
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Beautiful photographic print: ${product.name}`,
    image: [product.imageUrl],
    brand: {
      '@type': 'Brand',
      name: siteConfig.storeName
    },
    manufacturer: {
      '@type': 'Organization',
      name: siteConfig.ownerName
    },
    category: 'Photography Prints',
    sku: product.id,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'GBP', // TODO: Make currency configurable in site config
      lowPrice: (lowestPrice / 100).toFixed(2),
      highPrice: (highestPrice / 100).toFixed(2),
      offerCount: sizes.length,
      availability: product.active 
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/store/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: siteConfig.storeName
      }
    },
    // Only include aggregateRating and review if actual data exists
    // TODO: Implement actual review fetching when review system is implemented
  }
}

interface StoreStructuredDataProps {
  products: (Product & { priceWithTax: number })[]
  baseUrl: string
}

export function generateStoreStructuredData({ 
  products, 
  baseUrl 
}: StoreStructuredDataProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Photography Print Store',
    description: 'Beautiful photographic prints for your home and office',
    url: `${baseUrl}/store`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.imageUrl,
        url: `${baseUrl}/store/${product.slug}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'GBP', // TODO: Make currency configurable in site config
          price: (product.priceWithTax / 100).toFixed(2),
          availability: product.active 
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock'
        }
      }
    }))
  }
}

export function generateBreadcrumbStructuredData(items: Array<{
  name: string
  url: string
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

interface ImageStructuredDataProps {
  image: {
    id: number
    name: string | null
    description: string | null
    fileUrl: string
    tags: string | null
  }
  baseUrl: string
}

interface BlogPostStructuredDataProps {
  post: {
    title: string
    description: string | null
    slug: string
    publishedAt: Date | null
    content: string
  }
  baseUrl: string
}

export function generateImageStructuredData({ 
  image, 
  baseUrl 
}: ImageStructuredDataProps) {
  const keywords = image.tags ? image.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Photograph',
    name: image.name || `Professional photograph by ${siteConfig.ownerName}`,
    description: image.description || `A stunning photograph captured by professional photographer ${siteConfig.ownerName}`,
    url: `${baseUrl}/photo/${image.id}`,
    image: image.fileUrl,
    creator: {
      '@type': 'Person',
      name: siteConfig.ownerName,
      jobTitle: 'Professional Photographer',
      url: baseUrl
    },
    copyrightHolder: {
      '@type': 'Person',
      name: siteConfig.ownerName
    },
    keywords: keywords.length > 0 ? keywords : ['photography', 'professional photography', 'fine art'],
    inLanguage: 'en-US',
    dateCreated: new Date().toISOString().split('T')[0], // Use current date as fallback
    genre: 'Photography'
  }
}

export function generateBlogPostStructuredData({ 
  post, 
  baseUrl 
}: BlogPostStructuredDataProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description || '',
    url: `${baseUrl}/blog/${post.slug}`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.publishedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: siteConfig.ownerName,
      jobTitle: 'Professional Photographer',
      url: baseUrl
    },
    publisher: {
      '@type': 'Person',
      name: siteConfig.ownerName,
      url: baseUrl
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`
    },
    articleSection: 'Photography',
    inLanguage: 'en-US',
    image: siteConfig.seo.openGraph.images[0]?.url
  }
}