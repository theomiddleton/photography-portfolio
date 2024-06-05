import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { blogs, blogImages } from '~/server/db/schema'

export async function POST(request: Request) {
    const { content } = await request.json()

    await db.insert(blogs).values({
        content: content,
    })

    const about = await db
        .select({
            id: blogs.id,
        })
        .from(blogs)
        .where(eq(blogs.title, sql.placeholder('title')))
        .execute({ title: title })

    console.log('Inserted data:', about)

    return Response.json({ about })
}

export const runtime = 'edge'