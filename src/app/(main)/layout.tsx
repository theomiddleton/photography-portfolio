import { siteConfig } from '~/config/site'
import { SiteHeader } from '~/components/site-header'
import { SiteFooter } from '~/components/site-footer'
import Script from 'next/script'

export const metadata = {
  title: {
    default: `${siteConfig.ownerName} | ${siteConfig.title}`,
    template: `%s | ${siteConfig.ownerName}`,
  },
  description: siteConfig.description,
  openGraph: {
    ...siteConfig.seo.openGraph,
    title: `${siteConfig.ownerName} | ${siteConfig.title}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: `${siteConfig.ownerName} ${siteConfig.title}`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.ownerName} | ${siteConfig.title}`,
    description: siteConfig.description,
    images: siteConfig.seo.openGraph.images,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Script
        id="structured-data"
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
            jobTitle: 'Photographer',
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
            name: `${siteConfig.ownerName} ${siteConfig.title}`,
            url: siteConfig.url,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteConfig.url}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
