'use server'

import { revalidatePath } from 'next/cache'
import { db } from '~/server/db'
import { blogPosts } from '~/server/db/schema'
import { eq, desc } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { redirect } from 'next/navigation'

export async function createPost(data: {
  title: string
  slug: string
  description?: string
  content: string
  published: boolean
  authorId: number
}) {
  console.log('creating post', data)
  const post = await db
    .insert(blogPosts)
    .values({
      id: uuidv4(),
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      content: data.content,
      published: data.published,
      publishedAt: data.published ? new Date() : null,
      authorId: data.authorId,
    })
    .returning()

  revalidatePath('/admin')
  revalidatePath('/blog')

  if (data.published) {
    revalidatePath(`/blog/${data.slug}`)
  }

  return post[0]
}

export async function updatePost(slug: string, data: {
  title?: string
  slug?: string
  description?: string
  content?: string
  published?: boolean
  authorId?: number
}) {
  // Get the current post to check if we're changing publish status
  const currentPost = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1)
    .execute()
    .then(rows => rows[0])

  if (!currentPost) {
    throw new Error('Post not found')
  }

  console.log('Updating post', slug)
  // If slug is being changed, ensure it's unique
  if (data.slug && data.slug !== currentPost.slug) {
    const existingPost = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, data.slug))
      .limit(1)
    if (existingPost.length > 0) {
      throw new Error('Slug must be unique')
    }
  }

  // If title is being changed, ensure it's not empty
  if (data.title && data.title.trim() === '') {
    throw new Error('Title cannot be empty')
  }

  // Update the post
  const updatedPost = await db
    .update(blogPosts)
    .set({
      ...data,
      updatedAt: new Date(),
      ...(data.published && !currentPost.published
        ? { publishedAt: new Date() }
        : {}),
    })
    .where(eq(blogPosts.slug, slug))
    .returning()
  console.log('Updated post')

  revalidatePath('/admin')
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)

  return updatedPost[0]
}

export async function deletePost(id: string) {
  const post = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1).execute().then(rows => rows[0])

  if (!post) {
    throw new Error('Post not found')
  }

  // Delete the post
  await db.delete(blogPosts).where(eq(blogPosts.id, id))

  revalidatePath('/admin')
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)

  redirect('/admin')
}

export async function getPublishedPosts() {
  return db.select().from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.publishedAt))
}

export async function getPostBySlug(slug: string) {
  return db.select().from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1)
    .then(rows => rows[0] || null)
}

export async function getAllPosts() {
  return db.select().from(blogPosts)
    .orderBy(desc(blogPosts.updatedAt))
}