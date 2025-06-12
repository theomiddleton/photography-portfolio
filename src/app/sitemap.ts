import type { MetadataRoute } from 'next'
import { siteConfig } from '~/config/site'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrls = [siteConfig.url, siteConfig.altUrl]
  const images = await db
    .select({
      id: imageData.id,
      lastModified: imageData.modifiedAt,
    })
    .from(imageData)
    .where(eq(imageData.visible, true))

  const routes = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/store', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/admin', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/auth-test', changeFrequency: 'weekly', priority: 0.5 },
  ]

  const authRoutes = ['/login', '/logout', '/signin', '/signup']
  const adminRoutes = [
    '/admin/about',
    '/admin/blog',
    '/admin/blog/edit',
    '/admin/blog/new',
    '/admin/emails',
    '/admin/manage',
    '/admin/migrate',
    '/admin/pages',
    '/admin/pages/new',
    '/admin/store',
    '/admin/store/costs',
    '/admin/store/frame',
    '/admin/upload',
    '/admin/users',
    '/admin/videos',
    '/admin/videos/new',
  ]
  const storeRoutes = ['/store/checkout']

  return baseUrls.flatMap((baseUrl) => [
    ...routes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: route.priority,
    })),
    ...images.map((image) => ({
      url: `${baseUrl}/photo/${image.id}`,
      lastModified: new Date(image.lastModified),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...authRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...adminRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
    ...storeRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ])
}