import type { MetadataRoute } from 'next'
import { siteConfig } from '~/config/site'
import { db } from '~/server/db'
import { 
  imageData, 
  blogPosts, 
  customPages, 
  videos, 
  galleries, 
  multiGalleryPages,
  products,
  productSizes 
} from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'
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

  // Auth routes (lower priority, monthly updates)
  const authRoutes = ['/login', '/signup', '/forgot-password']

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

    // Get published custom pages
    const publishedCustomPages = await db
      .select({
        slug: customPages.slug,
        lastModified: customPages.updatedAt,
      })
      .from(customPages)
      .where(eq(customPages.isPublished, true))

    // Get visible videos
    const visibleVideos = await db
      .select({
        slug: videos.slug,
        lastModified: videos.modifiedAt,
      })
      .from(videos)
      .where(eq(videos.isVisible, true))

    // Get public galleries
    const publicGalleries = await db
      .select({
        slug: galleries.slug,
        lastModified: galleries.updatedAt,
      })
      .from(galleries)
      .where(eq(galleries.isPublic, true))

    // Get public multi-gallery pages
    const publicMultiGalleryPages = await db
      .select({
        slug: multiGalleryPages.slug,
        lastModified: multiGalleryPages.updatedAt,
      })
      .from(multiGalleryPages)
      .where(eq(multiGalleryPages.isPublic, true))

    // Get visible images for photo routes
    const visibleImages = await db
      .select({
        id: imageData.id,
        lastModified: imageData.modifiedAt,
      })
      .from(imageData)
      .where(eq(imageData.visible, true))

    // Store routes and products (if store is enabled)
    let storeRoutes: Array<{ path: string; changeFrequency: string; priority: number; lastModified?: Date }> = []
    let storeProducts: Array<{ slug: string; lastModified: Date | null }> = []
    
    if (isStoreEnabledServer()) {
      storeRoutes = [
        { path: '/store', changeFrequency: 'daily', priority: 0.8 },
        { path: '/store/checkout', changeFrequency: 'monthly', priority: 0.6 },
      ]

      // Get active products
      storeProducts = await db
        .select({
          slug: products.slug,
          lastModified: products.updatedAt,
        })
        .from(products)
        .where(eq(products.active, true))
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

      // Auth routes (lower priority)
      authRoutes.forEach((route) => {
        sitemapEntries.push({
          url: `${baseUrl}${route}`,
          lastModified: new Date(),
          changeFrequency: 'yearly' as const,
          priority: 0.3,
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

      // Blog posts
      publishedBlogPosts.forEach((post) => {
        sitemapEntries.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.lastModified || post.publishedAt || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
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

      // Videos
      visibleVideos.forEach((video) => {
        sitemapEntries.push({
          url: `${baseUrl}/video/${video.slug}`,
          lastModified: video.lastModified || new Date(),
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

    return sitemapEntries

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