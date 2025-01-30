import type { MetadataRoute } from 'next'
import { siteConfig } from '~/config/site'

export default function robots(): MetadataRoute.Robots {
  const baseUrls = [siteConfig.url, siteConfig.altUrl]

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: baseUrls.map(url => `${url}/sitemap.xml`),
  }
}