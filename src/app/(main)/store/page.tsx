import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '~/server/db'
import { and, eq, desc } from 'drizzle-orm'
import { products, productSizes, storeCosts } from '~/server/db/schema'
import { StorePage } from '~/components/store/store-page'
import { isStoreEnabledServer } from '~/lib/store-utils'
import { generateStoreStructuredData, generateBreadcrumbStructuredData } from '~/lib/structured-data'
import { siteConfig } from '~/config/site'
import { seoUtils } from '~/lib/seo-utils'

export const metadata: Metadata = seoUtils.getStoreMetadata()

export const revalidate = 3600 // Revalidate every hour

async function getProducts() {
  const allProducts = await db.select().from(products)
  const costs = await db
    .select()
    .from(storeCosts)
    .where(eq(storeCosts.active, true))
    .orderBy(desc(storeCosts.createdAt))
    .limit(1)

  // Get the base prices for each product
  const productsWithPrices = await Promise.all(
    allProducts.map(async (product) => {
      const sizes = await db
        .select()
        .from(productSizes)
        .where(and(eq(productSizes.productId, product.id), eq(productSizes.active, true)))
        .orderBy(productSizes.basePrice)

      const lowestPrice = sizes[0]?.basePrice || 0
      const taxRate = costs[0]?.taxRate || 2000 // Default to 20% if not found
      const stripeTaxRate = costs[0]?.stripeTaxRate || 150 // Default to 1.5% if not found
      
      let displayPrice = lowestPrice
      if (!siteConfig.features.store.showTax) {
        // Include tax in displayed price when showTax is false
        // Match backend calculation: apply both taxes to base amount
        const totalTaxRate = (taxRate + stripeTaxRate) / 10000
        displayPrice = Math.round(lowestPrice * (1 + totalTaxRate))
      }

      return {
        ...product,
        priceWithTax: displayPrice,
      }
    })
  )

  return productsWithPrices
}

export default async function StorePageWrapper() {
  // Return 404 if store is disabled
  if (!isStoreEnabledServer()) {
    notFound()
  }

  const prints = await getProducts()
  const baseUrl = siteConfig.url || 'http://localhost:3000'

  // Generate structured data
  const storeStructuredData = generateStoreStructuredData({
    products: prints,
    baseUrl
  })

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: baseUrl },
    { name: 'Store', url: `${baseUrl}/store` }
  ])

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storeStructuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />

      <StorePage initialProducts={prints} />
    </>
  )
}
