'use server'

import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { about } from '~/server/db/schema'

export async function update(data) {
    const { content } = await data

    await db.insert(about).values({
        content: content,
    })

    return Response.json({ about })
}

export async function read(data) {
    const result = await db.select({
        id: about.id,
        content: about.content,
    }).from(about)
    
    return result
}

