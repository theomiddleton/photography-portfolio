'use server'

import { z } from 'zod'

const PostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isDraft: z.boolean()
})

type PostData = z.infer<typeof PostSchema>

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