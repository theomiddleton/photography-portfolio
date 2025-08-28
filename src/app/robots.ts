import type { MetadataRoute } from 'next'
import { siteConfig } from '~/config/site'

export default function robots(): MetadataRoute.Robots {
  const baseUrls = [siteConfig.url, siteConfig.altUrl]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/temp/',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
    ],
    sitemap: baseUrls.map(url => `${url}/sitemap.xml`),
    host: siteConfig.url,
  }
}