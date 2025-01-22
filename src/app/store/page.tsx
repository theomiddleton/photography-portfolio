import type { Metadata } from 'next'
import { db } from '~/server/db'
import { products } from '~/server/db/schema'
import { StoreGrid } from '~/components/store/store-grid'

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
  // return await db.select().from(products)
  
  const products = [
    {
      id: "f4c43e30-fb3f-4b76-a7d2-70892848e973",
      name: "Mountain Hut",
      description: "The original mountain hut for summiting the Eiger stands among the clouds.",
      price: 1599,
      imageUrl: "https://img.theomiddleton.me/d7582113-a958-4898-84a4-fe601ad58dcd.jpg",
      stripeProductId: "prod_123MountainHut",
      stripePriceId: "price_123MountainHut",
      active: true,
      createdAt: new Date("2025-01-22T12:00:00.000Z"),
      updatedAt: new Date("2025-01-22T12:00:00.000Z")
    },
    {
      id: "a5a98564-227f-4021-98b5-ecf42371237b",
      name: "Alpine Pastures",
      description: "Cows graze on mountain meadows in the shadow of the Eiger.",
      price: 2499,
      imageUrl: "https://img.theomiddleton.me/b8288887-0512-4885-9e80-2df2fe95d523.jpg",
      stripeProductId: "prod_123AlpinePastures",
      stripePriceId: "price_123AlpinePastures",
      active: true,
      createdAt: new Date("2025-01-22T12:00:00.000Z"),
      updatedAt: new Date("2025-01-22T12:00:00.000Z")
    },
    {
      id: "cd520ffb-b9f3-4e0c-a8a8-bbd177645b76",
      name: "Adriatic Tranquility",
      description: "A small white boat floats peacefully on the crystal-clear waters.",
      price: 1799,
      imageUrl: "https://img.theomiddleton.me/7b32be99-e9eb-4c6d-8624-830ac44a639a.jpg",
      stripeProductId: "prod_123Adriatic",
      stripePriceId: "price_123Adriatic",
      active: false,
      createdAt: new Date("2025-01-22T12:00:00.000Z"),
      updatedAt: new Date("2025-01-22T12:00:00.000Z")
    },
    {
      id: "799ebdc6-4995-4bfa-b1e3-2de1f3c2b80d",
      name: "Foggy Forest Path",
      description: "A quiet trail winds through the foggy Tarn Hows.",
      price: 1299,
      imageUrl: "https://img.theomiddleton.me/b2976c66-94b6-4d55-b65e-003c2c22ec6a.jpg",
      stripeProductId: "prod_123FoggyPath",
      stripePriceId: "price_123FoggyPath",
      active: true,
      createdAt: new Date("2025-01-22T12:00:00.000Z"),
      updatedAt: new Date("2025-01-22T12:00:00.000Z")
    },
    {
      id: "ee7c39e2-555f-4aa6-8c58-88a33b0d57d3",
      name: "Great Hill",
      description: "Lone trees frame a moor landscape.",
      price: 2099,
      imageUrl: "https://img.theomiddleton.me/96aa4595-a960-4a09-99f2-019daeddbda3.jpg",
      stripeProductId: "prod_123GreatHill",
      stripePriceId: "price_123GreatHill",
      active: false,
      createdAt: new Date("2025-01-22T12:00:00.000Z"),
      updatedAt: new Date("2025-01-22T12:00:00.000Z")
    }
  ]

  return products
}

export default async function StorePage() {
  const prints = await getProducts()

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Print Store</h1>
        <p className="text-gray-600">Each print is carefully produced on premium archival paper</p>
      </div>
      <StoreGrid prints={prints} />
    </main>
  )
}

