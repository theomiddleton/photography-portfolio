import { db } from '~/server/db'
import { basePrintSizes, storeCosts } from '~/server/db/schema'
import { desc, eq } from 'drizzle-orm'

import { Costs } from '~/components/store/admin/costs/costs'
import { Button } from '~/components/ui/button'
import { ChevronLeft } from 'lucide-react'

async function getPrintSizes() {
  return await db.select().from(basePrintSizes).orderBy(desc(basePrintSizes.createdAt))
}

async function getCosts() {
  const costs = await db.select()
    .from(storeCosts)
    .where(eq(storeCosts.active, true))
    .orderBy(desc(storeCosts.createdAt))
    .limit(1)

  return {
    initialTax: {
      taxRate: costs[0]?.taxRate ? costs[0].taxRate / 100 : 20,
      stripeRate: costs[0]?.stripeTaxRate ? costs[0].stripeTaxRate / 100 : 1.4,
    },
    shippingCosts: {
      domestic: costs[0]?.domesticShipping ?? 500,
      international: costs[0]?.internationalShipping ?? 1000,
    }
  }
}

export default async function CostsPage() {
  const [sizes, costs] = await Promise.all([
    getPrintSizes(),
    getCosts()
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
          initialShippingCosts={costs.shippingCosts}
        />
      </div>
    </main>
  )
}