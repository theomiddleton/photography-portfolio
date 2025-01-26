import { db } from '~/server/db'
import { basePrintSizes, storeCosts } from '~/server/db/schema'
import { desc, eq } from 'drizzle-orm'

import { Costs } from '~/components/store/admin/costs/costs'

async function getPrintSizes() {
  return await db.select().from(basePrintSizes).orderBy(desc(basePrintSizes.createdAt))
}

async function getTaxRate() {
  const costs = await db.select()
    .from(storeCosts)
    .where(eq(storeCosts.active, true))
    .orderBy(desc(storeCosts.createdAt))
    .limit(1)

  return costs[0]?.taxRate ? costs[0].taxRate / 100 : 20
}

async function getShippingCosts() {
  const costs = await db.select()
    .from(storeCosts)
    .where(eq(storeCosts.active, true))
    .orderBy(desc(storeCosts.createdAt))
    .limit(1)

  return {
    domestic: costs[0]?.domesticShipping ?? 500,
    international: costs[0]?.internationalShipping ?? 1000,
  }
}

export default async function CostsPage() {
  const [sizes, tax, shipping] = await Promise.all([getPrintSizes(), getTaxRate(), getShippingCosts()])

  return (
    <main className="container mx-auto px-4 py-12">
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold mb-8">Costs</h1>
        <Costs sizes={sizes} initialTaxRate={tax} initialShippingCosts={shipping} />
      </div>
    </div>
  </main>
  )
}