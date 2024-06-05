import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { about } from '~/server/db/schema'

export async function POST(request: Request) {
    const { content } = await request.json()

    await db.insert(about).values({
        content: content,
    })

    return Response.json({ about })
}

export const runtime = 'edge'