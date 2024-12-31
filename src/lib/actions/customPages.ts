'use server'

import { db } from '~/server/db'
import { customPages } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const CustomPageSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-zA-Z0-9-]+$/),
  isPublished: z.boolean(),
})

export async function createCustomPage(formData: FormData) {
  const validatedFields = CustomPageSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
    slug: formData.get('slug'),
    isPublished: formData.get('isPublished') === 'true',
  })

  console.log('inserting to db: ', validatedFields)

  await db.insert(customPages).values({
    title: validatedFields.title,
    content: validatedFields.content,
    slug: validatedFields.slug,
    isPublished: validatedFields.isPublished,
  })

  revalidatePath('/admin/pages')
  redirect('/admin/pages')
}

export async function updateCustomPage(id: number, formData: FormData) {
  const validatedFields = CustomPageSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
    slug: formData.get('slug'),
    isPublished: formData.get('isPublished') === 'true',
  })

  await db
    .update(customPages)
    .set({
      ...validatedFields,
      updatedAt: new Date(),
    })
    .where(eq(customPages.id, id))

  revalidatePath('/admin/pages')
  revalidatePath(`/p/${validatedFields.slug}`)
  redirect('/admin/pages')
}

export async function deleteCustomPage(id: number) {
  await db.delete(customPages).where(eq(customPages.id, id))
  revalidatePath('/admin/pages')
}

export async function getCustomPage(slug: string) {
  const page = await db
    .select()
    .from(customPages)
    .where(eq(customPages.slug, slug))
    .limit(1)

  return page[0]
}

export async function getCustomPages() {
  return db.select().from(customPages).orderBy(customPages.createdAt)
}

export async function getPublishedCustomPages() {
  return db
    .select()
    .from(customPages)
    .where(eq(customPages.isPublished, true))
    .orderBy(customPages.createdAt)
}