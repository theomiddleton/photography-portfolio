import '~/styles/globals.css'
import { siteConfig } from '~/config/site'
import { SiteFooter } from '~/components/site-footer'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AxiomWebVitals } from 'next-axiom'
import { VercelToolbar } from '@vercel/toolbar/next'

import { FlagValues } from '@vercel/flags/react'
import { get } from '@vercel/edge-config'
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

  // checks if the toolbar should be injected, this is only done in development
  const shouldInjectToolbar = process.env.NODE_ENV === 'development'
  // reads the edgeConfif for feature flags
  // const edgeConfigFlags = await get('featureFlags')

  // const flags: Record<string, boolean> = typeof edgeConfigFlags === 'object' && edgeConfigFlags !== null
  //   ? Object.entries(edgeConfigFlags).reduce((acc, [key, value]) => {
  //       if (typeof value === 'boolean') {
  //         acc[key] = value
  //       }
  //       return acc
  //     }, {} as Record<string, boolean>)
  //   : {}


  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        {/* children is the main content of the page, as defined in page.tsx */}
        {children}
        {/* analytics, webvitals, toolbar, and speed insights are used in development */}
        <Analytics />
        <AxiomWebVitals />
        <SpeedInsights />
        {shouldInjectToolbar && <VercelToolbar />}
        {/* <FlagValues values={flags} /> */}
      </body>
      <SiteFooter />
    </html>
  ) 
}