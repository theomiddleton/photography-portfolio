/**
 * Comprehensive SEO-optimized sitemap for the portfolio website
 * 
 * Features:
 * - Includes all public dynamic content (blog posts, custom pages, galleries, images, store products)
 * - Excludes admin routes for security and SEO (handled by robots.txt)
 * - Optimized priorities and change frequencies for different content types
 * - Recent blog posts get higher priority and more frequent updates
 * - Performance limits to prevent memory issues with large datasets
 * - Proper error handling with fallback sitemap
 * - Daily revalidation for optimal performance
 * - Supports multiple domains (primary and alternate)
 */

import type { MetadataRoute } from 'next'
import { siteConfig } from '~/config/site'
import { db } from '~/server/db'
import { 
  imageData, 
  blogPosts, 
  customPages, 
  galleries, 
  multiGalleryPages,
  products
} from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { isStoreEnabledServer } from '~/lib/store-utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrls = [siteConfig.url, siteConfig.altUrl]
  
  // Static routes with SEO-optimized priorities and change frequencies
  const staticRoutes = [
    { path: '', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/blog', changeFrequency: 'daily', priority: 0.8 },
    { path: '/files', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/success', changeFrequency: 'yearly', priority: 0.3 },
  ] as const

  try {
    // Get published blog posts
    const publishedBlogPosts = await db
      .select({
        slug: blogPosts.slug,
        lastModified: blogPosts.updatedAt,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .limit(1000) // Reasonable limit for performance

    // Get published custom pages
    const publishedCustomPages = await db
      .select({
        slug: customPages.slug,
        lastModified: customPages.updatedAt,
      })
      .from(customPages)
      .where(eq(customPages.isPublished, true))
      .limit(500) // Reasonable limit

    // Get public galleries
    const publicGalleries = await db
      .select({
        slug: galleries.slug,
        lastModified: galleries.updatedAt,
      })
      .from(galleries)
      .where(eq(galleries.isPublic, true))
      .limit(200) // Reasonable limit

    // Get public multi-gallery pages
    const publicMultiGalleryPages = await db
      .select({
        slug: multiGalleryPages.slug,
        lastModified: multiGalleryPages.updatedAt,
      })
      .from(multiGalleryPages)
      .where(eq(multiGalleryPages.isPublic, true))
      .limit(200) // Reasonable limit

    // Get visible images for photo routes (limit for performance)
    const visibleImages = await db
      .select({
        id: imageData.id,
        lastModified: imageData.modifiedAt,
      })
      .from(imageData)
      .where(eq(imageData.visible, true))
      .limit(5000) // Reasonable limit for large image collections

    // Store routes and products (if store is enabled)
    let storeRoutes: { path: string; changeFrequency: string; priority: number; lastModified?: Date }[] = []
    let storeProducts: { slug: string; lastModified: Date | null }[] = []
    
    if (isStoreEnabledServer()) {
      storeRoutes = [
        { path: '/store', changeFrequency: 'daily', priority: 0.8 },
      ]

      // Get active products
      storeProducts = await db
        .select({
          slug: products.slug,
          lastModified: products.updatedAt,
        })
        .from(products)
        .where(eq(products.active, true))
        .limit(1000) // Reasonable limit for store products
    }

    // Build sitemap entries
    const sitemapEntries: MetadataRoute.Sitemap = []

    baseUrls.forEach((baseUrl) => {
      // Static routes
      staticRoutes.forEach((route) => {
        sitemapEntries.push({
          url: `${baseUrl}${route.path}`,
          lastModified: new Date(),
          changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]['changeFrequency'],
          priority: route.priority,
        })
      })

      // Store routes
      storeRoutes.forEach((route) => {
        sitemapEntries.push({
          url: `${baseUrl}${route.path}`,
          lastModified: route.lastModified || new Date(),
          changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]['changeFrequency'],
          priority: route.priority,
        })
      })

      // Blog posts (higher priority for recent posts)
      publishedBlogPosts.forEach((post) => {
        const isRecent = post.publishedAt && 
          new Date(post.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days
        
        sitemapEntries.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.lastModified || post.publishedAt || new Date(),
          changeFrequency: isRecent ? 'daily' : 'weekly' as const,
          priority: isRecent ? 0.8 : 0.7,
        })
      })

      // Custom pages
      publishedCustomPages.forEach((page) => {
        sitemapEntries.push({
          url: `${baseUrl}/p/${page.slug}`,
          lastModified: page.lastModified || new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        })
      })

      // Galleries
      publicGalleries.forEach((gallery) => {
        sitemapEntries.push({
          url: `${baseUrl}/g/${gallery.slug}`,
          lastModified: gallery.lastModified || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      })

      // Multi-gallery pages
      publicMultiGalleryPages.forEach((page) => {
        sitemapEntries.push({
          url: `${baseUrl}/g/${page.slug}`,
          lastModified: page.lastModified || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      })

      // Individual photos
      visibleImages.forEach((image) => {
        sitemapEntries.push({
          url: `${baseUrl}/photo/${image.id}`,
          lastModified: image.lastModified || new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        })
      })

      // Store products
      storeProducts.forEach((product) => {
        sitemapEntries.push({
          url: `${baseUrl}/store/${product.slug}`,
          lastModified: product.lastModified || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      })
    })

    // Dedupe by URL; keep the entry with the newer lastModified  
    const byUrl = new Map<string, MetadataRoute.Sitemap[number]>()  
    for (const e of sitemapEntries) {  
      const prev = byUrl.get(e.url)  
      if (!prev) {  
        byUrl.set(e.url, e)  
      } else {  
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prevDate = prev.lastModified ? new Date(prev.lastModified as any).getTime() : 0  
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const curDate = e.lastModified ? new Date(e.lastModified as any).getTime() : 0  
        byUrl.set(e.url, curDate >= prevDate ? e : prev)  
      }  
    }  
    return Array.from(byUrl.values()) 

  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback to basic sitemap if database queries fail
    return baseUrls.flatMap((baseUrl) => 
      staticRoutes.map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]['changeFrequency'],
        priority: route.priority,
      }))
    )
  }
}

// Revalidate sitemap daily for performance
export const revalidate = 86400