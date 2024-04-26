import "~/styles/globals.css" 
import { siteConfig } from "~/config/site"
import { SiteFooter } from "~/components/site-footer" 
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AxiomWebVitals } from 'next-axiom';

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
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        {children}
        <Analytics />
        <AxiomWebVitals />
        <SpeedInsights />
      </body>
      <SiteFooter />
    </html>
  ) 
}