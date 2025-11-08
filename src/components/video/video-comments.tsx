'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Badge } from '~/components/ui/badge'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { Clock, Reply, Trash2, Check, X, Pin } from 'lucide-react'
import type { VideoComment } from '~/server/db/schema'

interface VideoCommentsProps {
  videoId: string
  commentsEnabled: boolean
  allowAnonymousComments: boolean
  requireApproval: boolean
  commentsLocked: boolean
  isAdmin?: boolean
  currentUserId?: number | null
  currentVideoTime?: number
}

interface CommentWithReplies extends VideoComment {
  replies?: CommentWithReplies[]
}

export function VideoComments({
  videoId,
  commentsEnabled,
  allowAnonymousComments,
  requireApproval,
  commentsLocked,
  isAdmin = false,
  currentUserId = null,
  currentVideoTime = 0,
}: VideoCommentsProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  // Auto-capture timestamp from current video time
  const timestamp = currentVideoTime > 0 ? currentVideoTime : undefined
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      const url = `/api/videos/${videoId}/comments${isAdmin ? '?includeUnapproved=true' : ''}`
      const response = await fetch(url)
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }, [videoId, isAdmin])

  useEffect(() => {
    if (commentsEnabled) {
      fetchComments()
    }
  }, [commentsEnabled, fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('Submitting comment:', {
      content,
      authorName,
      authorEmail,
      timestamp,
      replyingTo,
    })

    if (!content.trim()) {
      toast.error('Please enter a comment')
      return
    }

    if (
      !currentUserId &&
      allowAnonymousComments &&
      (!authorName || !authorEmail)
    ) {
      toast.error('Please provide your name and email')
      return
    }

    setSubmitting(true)

    try {
      // For logged-in users, don't send authorName/authorEmail - let backend use session data
      const requestBody: {
        content: string
        timestamp?: number
        parentId?: string
        authorName?: string
        authorEmail?: string
      } = {
        content,
        timestamp,
      }

      // Only include parentId if replying to a comment
      if (replyingTo) {
        requestBody.parentId = replyingTo
      }

      // Only include author info for anonymous users
      if (!currentUserId && allowAnonymousComments) {
        requestBody.authorName = authorName
        requestBody.authorEmail = authorEmail
      }

      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment')
      }

      toast.success(data.message || 'Comment posted successfully')
      setContent('')
      setAuthorName('')
      setAuthorEmail('')
      setReplyingTo(null)
      await fetchComments()
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to post comment',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/videos/${videoId}/comments/${commentId}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }

      toast.success('Comment deleted')
      await fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const handleApprove = async (commentId: string, isApproved: boolean) => {
    try {
      const response = await fetch(
        `/api/videos/${videoId}/comments/${commentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isApproved }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to update comment')
      }

      toast.success(isApproved ? 'Comment approved' : 'Comment rejected')
      await fetchComments()
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    }
  }

  const handlePin = async (commentId: string, isPinned: boolean) => {
    try {
      const response = await fetch(
        `/api/videos/${videoId}/comments/${commentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPinned }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to update comment')
      }

      toast.success(isPinned ? 'Comment pinned' : 'Comment unpinned')
      await fetchComments()
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    }
  }

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: CommentWithReplies
    depth?: number
  }) => {
    const canDelete = isAdmin || comment.userId === currentUserId
    const canModerate = isAdmin

    return (
      <div
        className={`space-y-2 ${depth > 0 ? 'mt-4 ml-8 border-l-2 pl-4' : ''}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{comment.authorName}</span>
              {comment.timestamp !== null && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(comment.timestamp)}
                </Badge>
              )}
              {comment.isPinned && (
                <Badge variant="default" className="gap-1">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
              {!comment.isApproved && (
                <Badge variant="secondary">Pending Approval</Badge>
              )}
              {comment.isEdited && (
                <Badge variant="outline" className="text-xs">
                  Edited
                </Badge>
              )}
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="mt-2 text-sm">{comment.content}</p>
            <div className="mt-2 flex gap-2">
              {!commentsLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  <Reply className="mr-1 h-3 w-3" />
                  Reply
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              )}
              {canModerate && !comment.isApproved && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApprove(comment.id, true)}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApprove(comment.id, false)}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Reject
                  </Button>
                </>
              )}
              {canModerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePin(comment.id, !comment.isPinned)}
                >
                  <Pin className="mr-1 h-3 w-3" />
                  {comment.isPinned ? 'Unpin' : 'Pin'}
                </Button>
              )}
            </div>
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!commentsEnabled) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Comments {comments.length > 0 && `(${comments.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {!commentsLocked && (currentUserId || allowAnonymousComments) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {replyingTo && (
              <div className="bg-muted flex items-center justify-between rounded p-2">
                <span className="text-sm">Replying to comment</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {!currentUserId && allowAnonymousComments && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Your name *"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your email *"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  required
                />
              </div>
            )}

            <Textarea
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              required
            />

            <div className="flex items-center gap-4">
              {timestamp !== undefined && timestamp > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  Timestamp: {Math.floor(timestamp / 60)}:
                  {(timestamp % 60).toString().padStart(2, '0')}
                </Badge>
              )}
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>

            {requireApproval && (
              <p className="text-muted-foreground text-sm">
                Your comment will be visible after approval by a moderator.
              </p>
            )}
          </form>
        )}

        {commentsLocked && (
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-muted-foreground text-sm">
              Comments are locked for this video
            </p>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <p className="text-muted-foreground text-center">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground text-center">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
