

import { eq, sql } from 'drizzle-orm' 
import { db } from '~/server/db'
import { blogs, blogImages } from '~/server/db/schema'

export async function POST(request: Request) {
    const { title, content } = await request.json()

    await db.insert(blogs).values({ 
        title: title,
        content: content
    })

    const blog = await db
        .select({
            id: blogs.id,
        })
        .from(blogs)
        .where(eq(blogs.title, sql.placeholder('title')))
        .execute({ title: title })

    console.log('Inserted data:', blog)

    return Response.json({ blog })   
}

export const runtime = 'edge'