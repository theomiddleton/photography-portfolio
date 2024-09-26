'use server'

import { z } from 'zod'

import { db } from '~/server/db'
import { blogs } from '~/server/db/schema'
import type { Post } from '~/lib/types/Post'

const PostSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isDraft: z.boolean()
})

export type PostData = z.infer<typeof PostSchema>

export async function savePost(data: PostData) {
  try {
    const validatedData = PostSchema.parse(data)
    
    console.log('Saving post:', validatedData)

    return { 
      success: true, 
      message: validatedData.isDraft ? 'Draft saved successfully' : 'Post published successfully' 
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

export async function loadDraft(id: number): Promise<PostData | null> {

  return {
    id,
    title: 'Title',
    content: 'Sample content \n\n newline\n # Heading',
    isDraft: true
  }
}

export async function deletePost(id: number) {
  console.log('Deleting post:', id)
  return { success: true, message: 'Post deleted successfully' }
}

export async function getPosts(): Promise<Post[]> {
  const posts: Post[] = await db.select().from(blogs)
  return posts
}