'use server'

import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { about } from '~/server/db/schema'

export async function read() {
  const result = await db.select({
    id: about.id,
    content: about.content,
  }).from(about).where(eq(about.current, true))
  return result
}

export async function write(content: string) {
  if (content === null || content === undefined) {
    return new Response('Invalid content', { status: 400 })
  } 
  await db.update(about)
    .set({ current: false })
    .where(eq(about.current, true))

  await db.insert(about).values({
    content: content,
    current: true,
  })
}