import { db } from '~/server/db'
import { orders } from '~/server/db/schema'
import { desc } from 'drizzle-orm'
import { isStoreEnabledServer } from '~/lib/store-utils'

// Mark as non-static
export const dynamic = 'force-dynamic'

import { db } from '~/server/db'
import { orders } from '~/server/db/schema'
import { desc } from 'drizzle-orm'
import { isStoreEnabledServer } from '~/lib/store-utils'
import { requireAdminAuth } from '~/lib/auth/permissions'

// Mark as non-static
export const dynamic = 'force-dynamic'

export async function GET() {
  // Return 404 if store is disabled
  if (!isStoreEnabledServer()) {
    return new Response('Not Found', { status: 404 })
  }

  // Require admin authorization to access order streams
  await requireAdminAuth()

  // …rest of the SSE streaming implementation…
}

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        while (true) {
          const recentOrders = await db.select()
            .from(orders)
            .orderBy(desc(orders.createdAt))
            // .limit(10)
            
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(recentOrders)}\n\n`)
          )
          
          await new Promise((resolve) => setTimeout(resolve, 5000))
        }
      } catch (error) {
        // Handle any errors
        controller.error(error)
      } finally {
        controller.close()
      }
    },
    
    cancel() {
      // Clean up resources if needed
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}