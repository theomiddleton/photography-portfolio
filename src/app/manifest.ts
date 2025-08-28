import type { MetadataRoute } from 'next'
import { siteConfig } from '~/config/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.ownerName} Photography Portfolio`,
    short_name: `${siteConfig.ownerName} Photography`,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    categories: ['photography', 'art', 'portfolio'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: siteConfig.seo.openGraph.images[0].url,
        sizes: '1200x630',
        type: 'image/jpeg',
        form_factor: 'wide',
        label: 'Photography Portfolio Homepage',
      },
    ],
  }
}