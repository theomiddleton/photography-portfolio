import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { about } from '~/server/db/schema'

export async function POST(request: Request) {
    const { content } = await request.json()

    if (content === null || content === undefined) {
        return new Response('Invalid content', { status: 400 });
    }

    const result = await db.insert(about).values({
        content: content,
    })

    return Response.json({ about: result })
}