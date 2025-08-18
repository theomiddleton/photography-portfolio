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
      priceCurrency: 'USD',
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
          priceCurrency: 'USD',
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