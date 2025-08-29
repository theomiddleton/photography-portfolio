import { siteConfig } from '~/config/site'
import { SiteHeader } from '~/components/site-header'
import { SiteFooter } from '~/components/site-footer'
import Script from 'next/script'
import { generateSEOMetadata, generateStructuredData } from '~/lib/seo-utils'

export const metadata = generateSEOMetadata({
  type: 'home',
  title: `${siteConfig.ownerName} | ${siteConfig.title}`,
  description: siteConfig.description,
})

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Generate dynamic structured data using the SEO utilities
  const personSchema = generateStructuredData('person', {})
  const websiteSchema = generateStructuredData('website', {})

  return (
    <div className="flex min-h-screen flex-col">
      <Script
        id="structured-data-person"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema),
        }}
      />
      <Script
        id="structured-data-website"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema).replace(/</g, '\\u003c'),
        }}
      />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
