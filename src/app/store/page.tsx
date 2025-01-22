import type { Metadata } from 'next'
import { db } from '~/server/db'
import { products } from '~/server/db/schema'
import { StoreGrid } from '~/components/store/store-grid'
import { SiteHeader } from '~/components/site-header'

export const metadata: Metadata = {
  title: 'Print Store | Photography Portfolio',
  description: 'Purchase beautiful photographic prints from our curated collection',
  openGraph: {
    title: 'Print Store | Photography Portfolio',
    description: 'Purchase beautiful photographic prints from our curated collection',
    type: 'website',
  },
}

export const revalidate = 3600 // Revalidate every hour

async function getProducts() {
  return await db.select().from(products)
}

export default async function StorePage() {
  const prints = await getProducts()

  return (
    <>
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Print Store</h1>
        </div>
        <StoreGrid prints={prints} />
      </main>
    </>
  )
}

