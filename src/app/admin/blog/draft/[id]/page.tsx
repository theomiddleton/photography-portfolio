'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { notFound } from 'next/navigation'

import { loadDraft, savePost } from '~/lib/actions/blog'
import type { PostData } from '~/lib/actions/blog'

interface FeedbackState {
  type: 'success' | 'error' | null
  message: string
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DraftEditor({ params }: { params: { id: string } }) {
  const draftId = parseInt(params.id, 10)
  
  const [draft, setDraft] = useState<PostData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' })

  if (isNaN(draftId)) {
    notFound()
  }

  useEffect(() => {
    const fetchDraft = async () => {
      const loadedDraft = await loadDraft(draftId)
      console.log('loaded draft: ', loadedDraft)
      if (loadedDraft) {
        setDraft(loadedDraft)
      } else {
        setFeedback({ type: 'error', message: 'Failed to load draft' })
      }
      setIsLoading(false)
    }
    fetchDraft()
  }, [draftId])

  const handleSave = async (publish: boolean) => {
    if (!draft) return

    setIsSaving(true)
    setFeedback({ type: null, message: '' })
    try {
      const result = await savePost({ ...draft, isDraft: !publish })
      if (result.success) {
        setFeedback({ type: 'success', message: result.message })
        if (!publish) {
          setDraft({ ...draft, isDraft: true })
        }
      } else {
        setFeedback({ type: 'error', message: result.message })
      }
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading draft...</div>
  }

  if (!draft) {
    return <div className="h-screen flex items-center justify-center">Draft not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Draft</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Post Title
            </label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Enter your post title"
              className="mt-1"
              aria-label="Post title"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Post Content
            </label>
            <Textarea
              id="content"
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="Write your post content in Markdown"
              className="mt-1 h-[calc(100vh-400px)]"
              aria-label="Post content"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => handleSave(false)} disabled={isSaving} className="flex-1">
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={() => handleSave(true)} variant="outline" disabled={isSaving} className="flex-1">
              {isSaving ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
          {feedback.type && (
            <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'}>
              <AlertTitle>{feedback.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="border rounded-lg p-4 prose prose-sm max-w-none h-[calc(100vh-100px)] overflow-auto">
          <h1>{draft.title}</h1>
          <ReactMarkdown>{draft.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}