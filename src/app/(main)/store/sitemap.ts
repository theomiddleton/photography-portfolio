import { MetadataRoute } from 'next'
import { db } from '~/server/db'
import { products } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { siteConfig } from '~/config/site'
import { isStoreEnabledServer } from '~/lib/store-utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url || 'http://localhost:3000'
  
  const routes: MetadataRoute.Sitemap = []

  // Only include store routes if store is enabled
  if (isStoreEnabledServer()) {
    // Add main store page
    routes.push({
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })

    try {
      // Get all active products
      const activeProducts = await db
        .select({
          slug: products.slug,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .where(eq(products.active, true))

      // Add product pages
      activeProducts.forEach((product) => {
        routes.push({
          url: `${baseUrl}/store/${product.slug}`,
          lastModified: product.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      })
    } catch (error) {
      console.error('Error generating store sitemap:', error)
    }
  }

  return routes
}

export const revalidate = 86400 // Revalidate daily