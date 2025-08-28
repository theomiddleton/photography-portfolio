import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '~/server/db'
import { products, productSizes, storeCosts } from '~/server/db/schema'
import { eq, ne, and, desc } from 'drizzle-orm'
import { EnhancedProductView } from '~/components/store/enhanced-product-view'
import { siteConfig } from '~/config/site'
import { isStoreEnabledServer } from '~/lib/store-utils'
import {
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
} from '~/lib/structured-data'
import { 
  generateSEOMetadata, 
  generateOGImageUrl, 
  generateKeywordDescription 
} from '~/lib/seo-utils'
import { seoKeywords } from '~/config/seo'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

async function getProduct(slug: string) {
  const product = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1)
  return product[0]
}

async function getProductSizes(productId: string) {
  return await db
    .select()
    .from(productSizes)
    .where(eq(productSizes.productId, productId))
}

async function getRecommendations(currentProductId: string) {
  // Get other active products as recommendations
  const recommendedProducts = await db
    .select()
    .from(products)
    .where(and(ne(products.id, currentProductId), eq(products.active, true)))
    .limit(4)

  // Get costs for price calculation
  const costs = await db
    .select()
    .from(storeCosts)
    .where(eq(storeCosts.active, true))
    .orderBy(desc(storeCosts.createdAt))
    .limit(1)

  // Calculate prices for recommendations
  const productsWithPrices = await Promise.all(
    recommendedProducts.map(async (product) => {
      const sizes = await db
        .select()
        .from(productSizes)
        .where(
          and(
            eq(productSizes.productId, product.id),
            eq(productSizes.active, true),
          ),
        )
        .orderBy(productSizes.basePrice)

      const lowestPrice = sizes[0]?.basePrice || 0
      const taxRate = costs[0]?.taxRate || 2000
      const stripeTaxRate = costs[0]?.stripeTaxRate || 150

      let priceWithTax = lowestPrice
      if (!siteConfig.features.store.showTax) {
        // Include tax in displayed price when showTax is false
        const taxAmount = Math.round(lowestPrice * (taxRate / 10000))
        const stripeAmount = Math.round(lowestPrice * (stripeTaxRate / 10000))
        priceWithTax = lowestPrice + taxAmount + stripeAmount
      }

      return {
        ...product,
        priceWithTax,
      }
    }),
  )

  return productsWithPrices
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params

  // Return not found metadata if store is disabled
  if (!isStoreEnabledServer()) {
    return generateSEOMetadata({
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
      robots: { index: false, follow: false },
    })
  }

  const product = await getProduct(params.slug)

  if (!product) {
    return generateSEOMetadata({
      title: 'Print Not Found',
      description: 'The requested print could not be found.',
      robots: { index: false, follow: false },
    })
  }

  // Generate dynamic product description with keywords
  const productDescription = product.description 
    ? generateKeywordDescription(product.description, 'store', 160)
    : 'Beautiful photographic print available for purchase'

  // Generate OG image URL
  const ogImageUrl = generateOGImageUrl({
    image: product.imageUrl,
    title: product.name,
    type: 'product'
  })

  // Generate custom keywords combining store keywords with product-specific ones
  const customKeywords = [
    ...seoKeywords.store.slice(0, 4), // First 4 store keywords
    ...seoKeywords.technical.slice(0, 2), // First 2 technical keywords
    product.name.toLowerCase(),
    ...(product.description ? product.description.split(' ').slice(0, 3).map(word => word.toLowerCase().replace(/[^\w]/g, '')) : [])
  ]

  return generateSEOMetadata({
    type: 'product',
    title: `${product.name} | Print Store`,
    description: productDescription,
    keywords: customKeywords,
    openGraph: {
      title: `${product.name} | ${siteConfig.storeName}`,
      description: productDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    canonicalUrl: `/store/${params.slug}`,
  })
}

export default async function ProductPage(props: Props) {
  // Return 404 if store is disabled
  if (!isStoreEnabledServer()) {
    notFound()
  }

  const params = await props.params
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const [sizes, recommendations] = await Promise.all([
    getProductSizes(product.id),
    getRecommendations(product.id),
  ])

  // Get costs for tax calculation
  const costs = await db
    .select()
    .from(storeCosts)
    .where(eq(storeCosts.active, true))
    .orderBy(desc(storeCosts.createdAt))
    .limit(1)

  const taxRate = costs[0]?.taxRate || 2000 // Default to 20% if not found
  const stripeTaxRate = costs[0]?.stripeTaxRate || 150 // Default to 1.5% if not found

  // Calculate prices based on tax display setting
  const sizesWithPrices = sizes.map((size) => {
    let totalPrice = size.basePrice
    if (!siteConfig.features.store.showTax) {
      // Include tax in the displayed price
      const taxAmount = Math.round(size.basePrice * (taxRate / 10000))
      const stripeAmount = Math.round(size.basePrice * (stripeTaxRate / 10000))
      totalPrice = size.basePrice + taxAmount + stripeAmount
    }
    return {
      ...size,
      totalPrice,
    }
  })

  const baseUrl = siteConfig.url || 'http://localhost:3000'

  // Generate structured data
  const productStructuredData = generateProductStructuredData({
    product,
    sizes,
    baseUrl,
  })

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: baseUrl },
    { name: 'Store', url: `${baseUrl}/store` },
    { name: product.name, url: `${baseUrl}/store/${product.slug}` },
  ])

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData).replace(
            /</g,
            '\\u003c',
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData).replace(
            /</g,
            '\\u003c',
          ),
        }}
      />

      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 pt-24">
          <EnhancedProductView
            product={product}
            sizes={sizesWithPrices}
            recommendations={recommendations}
          />
        </div>
      </main>
    </>
  )
}
