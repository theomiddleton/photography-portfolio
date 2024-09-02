import "~/styles/globals.css" 
import { siteConfig } from "~/config/site"
import { SiteFooter } from "~/components/site-footer" 
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AxiomWebVitals } from 'next-axiom'
import { VercelToolbar } from '@vercel/toolbar/next'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode 
}) {
  const shouldInjectToolbar = process.env.NODE_ENV === 'development'
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        {children}
        <Analytics />
        <AxiomWebVitals />
        <SpeedInsights />
        {shouldInjectToolbar && <VercelToolbar />}
      </body>
      <SiteFooter />
    </html>
  ) 
}