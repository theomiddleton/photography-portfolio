import type { MetadataRoute } from 'next'
import { siteConfig } from '~/config/site'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url
  const images = await db
    .select({
      id: imageData.id,
      lastModified: imageData.modifiedAt,
    })
    .from(imageData)
    .where(eq(imageData.visible, true))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,  
    },
      {
        url: `${baseUrl}/store`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth-test`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5
    },
    ...images.map((image) => ({
      url: `${baseUrl}/photo/${image.id}`,
      lastModified: new Date(image.lastModified),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...[
        '/login',
        '/logout',
        '/signin',
        '/signup',
      ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
          changeFrequency: 'monthly' as const,
        priority: 0.5,
    })),
    ...[
      '/admin/about',
      '/admin/blog',
      '/admin/blog/draft',
      '/admin/blog/newpost',
      '/admin/manage',
      '/admin/store',
      '/admin/upload',
      '/admin/users',
      '/admin/videos',
    ].map((route) => ({
      url: `${baseUrl}${route}`,
        lastModified: new Date(),
          changeFrequency: 'daily' as const,
        priority: 0.6,
    })),
    ...[
      '/store/checkout',
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
        changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}