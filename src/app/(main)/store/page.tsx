import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '~/server/db'
import { and, eq, desc } from 'drizzle-orm'
import { products, productSizes, storeCosts } from '~/server/db/schema'
import { StorePage } from '~/components/store/store-page'
import { isStoreEnabledServer } from '~/lib/store-utils'

export const metadata: Metadata = {
  title: 'Print Store | Photography Portfolio',
  description: 'Purchase beautiful photographic prints from our curated collection',
  openGraph: {
    title: 'Print Store | Photography Portfolio',
    description: 'Purchase beautiful photographic prints from our curated collection',
    type: 'website',
  },
  keywords: ['photography prints', 'wall art', 'home decor', 'fine art photography'],
}

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
      const priceWithTax = Math.round(lowestPrice * (1 + taxRate / 10000))

      return {
        ...product,
        priceWithTax,
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
  return <StorePage initialProducts={prints} />
}
