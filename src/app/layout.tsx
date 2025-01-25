import '~/styles/globals.css'
import { siteConfig } from '~/config/site'
import { SiteHeader } from '~/components/site-header'
import { SiteFooter } from '~/components/site-footer'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AxiomWebVitals } from 'next-axiom'
import type { Metadata } from 'next/types'

import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  openGraph: {
    ...siteConfig.seo.openGraph,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.title,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    // url: siteConfig.url,
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode 
}) {

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <SiteHeader />
        {/* children is the main content of the page, as defined in page.tsx */}
        {children}
        {/* analytics, webvitals, toolbar, and speed insights are used in development */}
        <Analytics />
        <AxiomWebVitals />
        <SpeedInsights />
        <SiteFooter />
      </body>
    </html>
  ) 
}