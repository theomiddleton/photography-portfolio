import '~/styles/globals.css'
import { siteConfig } from '~/config/site'
import { SiteHeader } from '~/components/site-header'
import { SiteFooter } from '~/components/site-footer'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AxiomWebVitals } from 'next-axiom'
import type { Metadata } from 'next/types'
import { headers } from 'next/headers'

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

  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  const isAdminRoute = pathname.startsWith('/admin')
  console.log('Is admin route: ', isAdminRoute)

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} flex min-h-screen flex-col`}>
        {!isAdminRoute && <SiteHeader />}
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Analytics />
        <AxiomWebVitals />
        <SpeedInsights />
      </body>
    </html>
  ) 
}