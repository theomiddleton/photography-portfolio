'use server'

import { z } from 'zod'

import { db } from '~/server/db'
import { eq, and } from 'drizzle-orm'
import { blogs, blogImgData } from '~/server/db/schema'
import type { Post } from '~/lib/types/Post'

const PostSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isDraft: z.boolean(),
  tempId: z.string().optional()
})

export type PostData = z.infer<typeof PostSchema>

export async function savePost(data: PostData) {
  try {
    const validatedData = PostSchema.parse(data)
    
    console.log('Saving post:', validatedData)

    const [savedPost] = await db.insert(blogs).values({
      title: validatedData.title,
      content: validatedData.content,
      isDraft: validatedData.isDraft
    }).returning({ id: blogs.id })

    return { 
      success: true, 
      message: validatedData.isDraft ? 'Draft saved successfully' : 'Post published successfully',
      id: savedPost.id
    }
  } catch (error) {
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        message: 'Validation failed', 
        errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      }
    }
    
    return { 
      success: false, 
      message: 'An unexpected error occurred' 
    }
  }
}

export async function updateImageAssociations({ tempId, permanentId }: { tempId: string, permanentId: number }) {
  try {
    await db.update(blogImgData)
      .set({ blogId: permanentId })
      .where(eq(blogImgData.draftId, tempId))

    return { success: true, message: 'Image associations updated successfully' }
  } catch (error) {
    console.error('Failed to update image associations:', error)
    return { success: false, message: 'Failed to update image associations' }
  }
}

export async function loadDraft(id: number): Promise<PostData | null> {
  const [draft] = await db.select()
    .from(blogs)
    .where(eq(blogs.id, id))

  return draft ? { ...draft, isDraft: true } : null
}

export async function deletePost(id: number) {
  await db.delete(blogs).where(eq(blogs.id, id))
  return { success: true, message: 'Post deleted successfully' }
}

export async function getPosts(): Promise<Post[]> {
  const posts: Post[] = await db.select().from(blogs)
  return posts
}