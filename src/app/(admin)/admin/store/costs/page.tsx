import { notFound } from 'next/navigation'
import { db } from '~/server/db'
import { basePrintSizes, storeCosts, shippingMethods } from '~/server/db/schema'
import { desc, eq } from 'drizzle-orm'

import { Costs } from '~/components/store/admin/costs/costs'
import { Button } from '~/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { isStoreEnabledServer } from '~/lib/store-utils'

export const dynamic = 'force-dynamic'

async function getPrintSizes() {
  return await db.select().from(basePrintSizes).orderBy(desc(basePrintSizes.createdAt))
}

async function getShippingMethods() {
  return await db
    .select()
    .from(shippingMethods)
    .where(eq(shippingMethods.active, true))
}

async function getCosts() {
  const costs = await db.select()
    .from(storeCosts)
    .orderBy(desc(storeCosts.createdAt))
    .limit(1)

  if (!costs.length) {
    return {
      initialTax: {
        taxRate: 20,
        stripeRate: 1.4,
        profitPercentage: 20, // Default 20% profit
      }
    }
  }

  return {
    initialTax: {
      taxRate: costs[0].taxRate / 10000,
      stripeRate: costs[0].stripeTaxRate / 10000,
      profitPercentage: costs[0].profitPercentage ? costs[0].profitPercentage / 10000 : 20,
    }
  }
}

export default async function CostsPage() {
  // Return 404 if store is disabled
  if (!isStoreEnabledServer()) {
    notFound()
  }

  const [sizes, costs, shippingMethods] = await Promise.all([
    getPrintSizes(),
    getCosts(),
    getShippingMethods()
  ])

  return (
    <main>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <a href="/admin/store" className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </a>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Costs
          </h1>
        </div>
        <Costs 
          sizes={sizes} 
          initialTax={costs.initialTax}
          shippingMethods={shippingMethods}
        />
      </div>
    </main>
  )
}