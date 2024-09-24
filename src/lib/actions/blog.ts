'use server'

import { z } from 'zod'

// Define a schema for our post data
const PostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isDraft: z.boolean()
})

type PostData = z.infer<typeof PostSchema>

export async function savePost(data: PostData) {
  const validatedData = PostSchema.parse(data)

  console.log('Saving post:', validatedData)
  
  // Return a success message
  return { success: true, message: validatedData.isDraft ? 'Draft saved successfully' : 'Post published successfully' }
}