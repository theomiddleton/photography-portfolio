import "~/styles/globals.css" 
import { siteConfig } from "~/config/site"
import { SiteFooter } from "~/components/site-footer" 
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AxiomWebVitals } from 'next-axiom'
import { VercelToolbar } from '@vercel/toolbar/next'
import { FlagValues } from "@vercel/flags/react"
import { get } from '@vercel/edge-config'

import { Inter } from "next/font/google" 

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
}) 

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
} 

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode 
}) {

  const shouldInjectToolbar = process.env.NODE_ENV === 'development'
  const edgeConfigFlags = await get('featureFlags')

  const flags: Record<string, boolean> = typeof edgeConfigFlags === 'object' && edgeConfigFlags !== null
    ? Object.entries(edgeConfigFlags).reduce((acc, [key, value]) => {
        if (typeof value === 'boolean') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, boolean>)
    : {}

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        {children}
        <Analytics />
        <AxiomWebVitals />
        <SpeedInsights />
        {shouldInjectToolbar && <VercelToolbar />}
        <FlagValues values={flags} />
      </body>
      <SiteFooter />
    </html>
  ) 
}