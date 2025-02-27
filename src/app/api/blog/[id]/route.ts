import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { blogPosts, blogDrafts } from '~/server/db/schema'
import { z } from 'zod'

const BlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean().default(false),
})

// GET /api/blog/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    // First check if there's a draft
    const [draft] = await db
      .select()
      .from(blogDrafts)
      .where(eq(blogDrafts.postId, params.id))
      .limit(1)

    if (draft) {
      return Response.json({
        title: draft.title,
        description: draft.description,
        content: draft.content,
        published: false,
      })
    }

    // If no draft, get the published post
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, params.id))
      .limit(1)

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    return Response.json({
      title: post.title,
      description: post.description,
      content: post.content,
      published: post.published,
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return Response.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 },
    )
  }
}

// POST /api/blog/[id]/draft
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const data = await request.json()
    const validatedData = BlogPostSchema.parse(data)

    // Delete any existing drafts
    await db.delete(blogDrafts).where(eq(blogDrafts.postId, params.id))

    // Create new draft
    await db.insert(blogDrafts).values({
      postId: params.id,
      title: validatedData.title,
      description: validatedData.description,
      content: validatedData.content,
      // TODO: Get actual author ID from session
      authorId: 1,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error saving draft:', error)
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    return Response.json({ error: 'Failed to save draft' }, { status: 500 })
  }
}
