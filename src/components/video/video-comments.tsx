'use client'

import { useState, useEffect } from 'react'
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
}: VideoCommentsProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [timestamp, setTimestamp] = useState<number | undefined>()
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    if (commentsEnabled) {
      fetchComments()
    }
  }, [videoId, commentsEnabled])

  const fetchComments = async () => {
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error('Please enter a comment')
      return
    }

    if (!currentUserId && allowAnonymousComments && (!authorName || !authorEmail)) {
      toast.error('Please provide your name and email')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          authorName,
          authorEmail,
          timestamp,
          parentId: replyingTo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment')
      }

      toast.success(data.message || 'Comment posted successfully')
      setContent('')
      setAuthorName('')
      setAuthorEmail('')
      setTimestamp(undefined)
      setReplyingTo(null)
      await fetchComments()
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/videos/${videoId}/comments/${commentId}`, {
        method: 'DELETE',
      })

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
      const response = await fetch(`/api/videos/${videoId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved }),
      })

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
      const response = await fetch(`/api/videos/${videoId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned }),
      })

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

  const CommentItem = ({ comment, depth = 0 }: { comment: CommentWithReplies; depth?: number }) => {
    const canDelete = isAdmin || comment.userId === currentUserId
    const canModerate = isAdmin

    return (
      <div className={`space-y-2 ${depth > 0 ? 'ml-8 mt-4 border-l-2 pl-4' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
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
                <Badge variant="outline" className="text-xs">Edited</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="mt-2 text-sm">{comment.content}</p>
            <div className="flex gap-2 mt-2">
              {!commentsLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
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
                    <Check className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApprove(comment.id, false)}
                  >
                    <X className="h-3 w-3 mr-1" />
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
                  <Pin className="h-3 w-3 mr-1" />
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
              <div className="flex items-center justify-between bg-muted p-2 rounded">
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
              <Input
                type="number"
                placeholder="Timestamp (optional, in seconds)"
                value={timestamp || ''}
                onChange={(e) => setTimestamp(e.target.value ? parseInt(e.target.value) : undefined)}
                className="max-w-xs"
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>

            {requireApproval && (
              <p className="text-sm text-muted-foreground">
                Your comment will be visible after approval by a moderator.
              </p>
            )}
          </form>
        )}

        {commentsLocked && (
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Comments are locked for this video
            </p>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <p className="text-center text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
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
