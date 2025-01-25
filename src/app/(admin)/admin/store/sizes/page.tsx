import { db } from '~/server/db'
import { basePrintSizes } from '~/server/db/schema'
import { desc } from 'drizzle-orm'
import { PrintSizes } from '~/components/store/admin/print-sizes'

async function getPrintSizes() {
  return await db.select().from(basePrintSizes).orderBy(desc(basePrintSizes.createdAt))
}

export default async function PrintSizesPage() {
  const sizes = await getPrintSizes()

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold mb-8">Print Sizes</h1>
          <PrintSizes sizes={sizes} />
        </div>
      </div>
    </main>
  )
}

