'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { SimpleEditor } from '~/components/blog/editor'
import { toast } from 'sonner'

interface AboutFormProps {
  initialContent?: any
}

export function AboutForm({ initialContent }: AboutFormProps) {
  const router = useRouter()
  const editorRef = React.useRef<any>(null)
  const [title, setTitle] = React.useState(initialContent?.title ?? 'About Me')
  const [error, setError] = React.useState('')

  const handleSubmit = async (isDraft: boolean) => {
    setError('')
    try {
      // Get the current editor content
      const editorContent = editorRef.current?.editor?.getJSON() || {}
      console.log('Editor Content: ', editorContent)
      if (!editorContent || Object.keys(editorContent).length === 0) {
        setError('Content is required')
        toast.error('Content is required')
        return
      }

      if (!title.trim()) {
        setError('Title is required')
        toast.error('Title is required')
        return
      }

      const response = await fetch('/api/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: JSON.stringify(editorContent),
          // Note: The API always publishes (sets current: true),
          // so we don't need to handle draft logic here
        }),
      })

      const data = await response.json()

      if (!data.success) {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = data.errors
            .map((err: any) => err.message)
            .join(', ')
          setError(errorMessages)
          toast.error(`Validation failed: ${errorMessages}`)
        } else {
          setError(data.message || 'Failed to save about content')
          toast.error(data.message || 'Failed to save about content')
        }
        return
      }

      toast.success('About content published successfully')
      router.push('/admin/about')
    } catch (error) {
      console.error('Failed to save about content:', error)
      const errorMessage = 'Failed to save about content. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your About post title"
          />
        </div>
      </div>

      <Card>
        <CardContent>
          <SimpleEditor ref={editorRef} initialContent={initialContent} scope="about" />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.push('/admin/about')}>
          Cancel
        </Button>
        <Button onClick={() => handleSubmit(false)}>Publish About</Button>
      </div>
      {error && <div className="mb-2 text-sm text-red-500">{error}</div>}
    </div>
  )
}
