import { db } from '~/server/db'
import { orders } from '~/server/db/schema'
import { desc } from 'drizzle-orm'

// Mark as non-static
export const dynamic = 'force-dynamic'

export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        while (true) {
          const recentOrders = await db.select()
            .from(orders)
            .orderBy(desc(orders.createdAt))
            .limit(10)

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