import { db } from '~/server/db'
import { orders } from '~/server/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      while (true) {
        const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10)

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(recentOrders)}\n\n`))
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

