/**
 * Individual Comment Operations
 * - Delete comment (author or admin)
 * - Update comment (author only within 5 minutes)
 * - Approve/reject comment (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '~/server/db'
import { videoComments } from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { getSession } from '~/lib/auth/auth'

const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  isApproved: z.boolean().optional(),
  isPinned: z.boolean().optional(),
})

/**
 * PATCH /api/videos/[id]/comments/[commentId] - Update comment
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string; commentId: string }> },
) {
  const params = await props.params
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [comment] = await db
      .select()
      .from(videoComments)
      .where(
        and(
          eq(videoComments.id, params.commentId),
          eq(videoComments.videoId, params.id),
        ),
      )

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateCommentSchema.parse(body)

    const isAdmin = session.role === 'admin'
    const isAuthor = comment.userId === session.id

    // Check permissions
    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this comment' },
        { status: 403 },
      )
    }

    // Only admins can approve or pin
    if (
      (validatedData.isApproved !== undefined ||
        validatedData.isPinned !== undefined) &&
      !isAdmin
    ) {
      return NextResponse.json(
        { error: 'Only admins can approve or pin comments' },
        { status: 403 },
      )
    }

    // Authors can only edit within 5 minutes
    if (validatedData.content && isAuthor && !isAdmin) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      if (comment.createdAt < fiveMinutesAgo) {
        return NextResponse.json(
          { error: 'Comments can only be edited within 5 minutes of posting' },
          { status: 403 },
        )
      }
    }

    // Build update object
    const updateData: Partial<typeof videoComments.$inferInsert> = {
      updatedAt: new Date(),
    }

    if (validatedData.content) {
      updateData.content = validatedData.content
      updateData.isEdited = true
    }

    if (validatedData.isApproved !== undefined) {
      updateData.isApproved = validatedData.isApproved
    }

    if (validatedData.isPinned !== undefined) {
      updateData.isPinned = validatedData.isPinned
    }

    const [updatedComment] = await db
      .update(videoComments)
      .set(updateData)
      .where(
        and(
          eq(videoComments.id, params.commentId),
          eq(videoComments.videoId, params.id),
        ),
      )
      .returning()

    return NextResponse.json({ comment: updatedComment })
  } catch (error) {
    console.error('Error updating comment:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/videos/[id]/comments/[commentId] - Delete comment
 */
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string; commentId: string }> },
) {
  const params = await props.params
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [comment] = await db
      .select()
      .from(videoComments)
      .where(
        and(
          eq(videoComments.id, params.commentId),
          eq(videoComments.videoId, params.id),
        ),
      )

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const isAdmin = session.role === 'admin'
    const isAuthor = comment.userId === session.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this comment' },
        { status: 403 },
      )
    }

    await db
      .delete(videoComments)
      .where(
        and(
          eq(videoComments.id, params.commentId),
          eq(videoComments.videoId, params.id),
        ),
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 },
    )
  }
}
