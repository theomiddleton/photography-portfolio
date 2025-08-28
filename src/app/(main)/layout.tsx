import { siteConfig } from '~/config/site'
import { SiteHeader } from '~/components/site-header'
import { SiteFooter } from '~/components/site-footer'
import Script from 'next/script'

export const metadata = {
  title: {
    default: `${siteConfig.ownerName} | Professional Photography Portfolio`,
    template: `%s | ${siteConfig.ownerName} Photography`,
  },
  description: siteConfig.description,
  keywords: [
    ...siteConfig.seo.keywords.primary,
    ...siteConfig.seo.keywords.secondary,
    ...siteConfig.seo.keywords.local
  ].join(', '),
  authors: [{ name: siteConfig.ownerName }],
  creator: siteConfig.ownerName,
  openGraph: {
    ...siteConfig.seo.openGraph,
    title: `${siteConfig.ownerName} | Professional Photography Portfolio`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.seo.openGraph.siteName,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.ownerName} | Professional Photography Portfolio`,
    description: siteConfig.description,
    images: siteConfig.seo.openGraph.images,
    creator: '@theomiddleton_',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  alternates: {
    canonical: siteConfig.url,
  },
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Script
        id="photographer-person-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: siteConfig.ownerName,
            url: siteConfig.url,
            image: siteConfig.seo.openGraph.images[0].url,
            sameAs: Object.values(siteConfig.links).filter(Boolean),
            jobTitle: 'Professional Photographer',
            description: siteConfig.description,
            knowsAbout: [
              'Photography',
              'Portrait Photography',
              'Landscape Photography',
              'Event Photography',
              'Photo Editing',
              'Visual Storytelling'
            ],
            hasOccupation: {
              '@type': 'Occupation',
              name: 'Photographer',
              occupationLocation: {
                '@type': 'Country',
                name: 'United Kingdom'
              }
            }
          }),
        }}
      />
      <Script
        id="photography-business-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: `${siteConfig.ownerName} Photography`,
            description: 'Professional photography services specializing in portraits, landscapes, and events',
            url: siteConfig.url,
            image: siteConfig.seo.openGraph.images[0].url,
            founder: {
              '@type': 'Person',
              name: siteConfig.ownerName
            },
            serviceType: 'Photography Services',
            areaServed: {
              '@type': 'Country',
              name: 'United Kingdom'
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Photography Services',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Portrait Photography',
                    description: 'Professional portrait photography sessions'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Event Photography',
                    description: 'Professional event and occasion photography'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Landscape Photography',
                    description: 'Artistic landscape and nature photography'
                  }
                }
              ]
            }
          }),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteConfig.seo.openGraph.siteName,
            url: siteConfig.url,
            description: siteConfig.description,
            inLanguage: 'en-US',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteConfig.url}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
            mainEntity: {
              '@type': 'Person',
              name: siteConfig.ownerName,
              jobTitle: 'Professional Photographer'
            }
          }),
        }}
      />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
