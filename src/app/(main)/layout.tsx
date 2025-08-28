import { siteConfig } from '~/config/site'
import { SiteHeader } from '~/components/site-header'
import { SiteFooter } from '~/components/site-footer'
import { seoUtils } from '~/lib/seo-utils'
import Script from 'next/script'

export const metadata = {
  title: {
    default: seoUtils.getHomepageMetadata().title,
    template: `%s | ${siteConfig.ownerName} Photography`,
  },
  description: siteConfig.description,
  keywords: seoUtils.getKeywords(['primary', 'secondary', 'local']),
  authors: [{ name: siteConfig.ownerName }],
  creator: siteConfig.ownerName,
  openGraph: {
    ...seoUtils.getHomepageMetadata().openGraph,
  },
  twitter: {
    ...seoUtils.getHomepageMetadata().twitter,
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
          __html: JSON.stringify(seoUtils.getPersonSchema()),
        }}
      />
      <Script
        id="photography-business-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.getBusinessSchema()),
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
              jobTitle: siteConfig.seo.profession.title
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
