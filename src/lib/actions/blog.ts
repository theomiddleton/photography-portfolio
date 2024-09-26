'use server'

import { z } from 'zod'


const PostSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isDraft: z.boolean()
})

export type PostData = z.infer<typeof PostSchema>

import type { Post } from '~/lib/types/Post'

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
  return [
    { id: 1, title: 'Post 1', content: 'Content 1', isDraft: false, createdAt: new Date() },
    { id: 2, title: 'Post 2', content: 'Content 2', isDraft: false, createdAt: new Date() },
    { id: 3, title: 'Post 3', content: 'Content 3', isDraft: true, createdAt: new Date() },
  ]
}