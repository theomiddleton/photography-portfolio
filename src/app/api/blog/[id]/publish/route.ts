import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { blogPosts, blogDrafts, blogVersions } from '~/server/db/schema'
import { z } from 'zod'

const PublishPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const data = await request.json()
    const validatedData = PublishPostSchema.parse(data)

    // Get the current post
    const [currentPost] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, params.id))
      .limit(1)

    if (!currentPost) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    // Create a version of the current post
    await db.insert(blogVersions).values({
      postId: params.id,
      title: currentPost.title,
      description: currentPost.description,
      content: currentPost.content,
      // TODO: Get actual author ID from session
      authorId: 1,
    })

    // Update the post with new content
    await db
      .update(blogPosts)
      .set({
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        published: true,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, params.id))

    // Delete any existing drafts
    await db.delete(blogDrafts).where(eq(blogDrafts.postId, params.id))

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error publishing post:', error)
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    return Response.json({ error: 'Failed to publish post' }, { status: 500 })
  }
}
