'use server'

import { eq, sql } from 'drizzle-orm'
import { Turret_Road } from 'next/font/google'
import { db } from '~/server/db'
import { about } from '~/server/db/schema'

export async function read() {
    const result = await db.select({
        id: about.id,
        content: about.content,
    }).from(about).where(eq(about.current, true))
    return result
}

export async function write(request: Request) {
    const { content } = await request.json()
    if (content === null || content === undefined) {
        return new Response('Invalid content', { status: 400 });
    } 
    await db.update(about)
        .set({ current: false })
        .where(eq(about.current, true))

    const result = await db.insert(about).values({
        content: content,
        current: true,
    })

    return Response.json({ about: result })
}