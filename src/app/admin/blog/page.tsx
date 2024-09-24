'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

import { savePost } from '~/lib/actions/blog'

interface FeedbackState {
  type: 'success' | 'error' | null
  message: string
}

export default function BlogAdmin() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' })

  const handleSave = async (isDraft: boolean) => {
    setIsLoading(true)
    setFeedback({ type: null, message: '' })
    try {
      const result = await savePost({ title, content, isDraft })
      if (result.success) {
        setFeedback({ type: 'success', message: result.message })
      } else {
        setFeedback({ type: 'error', message: result.message })
      }
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'An error occurred. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Blog Editor
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Post Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content in Markdown"
              className="mt-1 h-[calc(100vh-400px)]"
              aria-label="Post content"
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Post Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title"
              className="mt-1"
              aria-label="Post title"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => handleSave(true)} variant="outline" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={() => handleSave(false)} disabled={isLoading} className="flex-1">
              {isLoading ? 'Publishing...' : 'Publish'}
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
          <h1>{title}</h1>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}