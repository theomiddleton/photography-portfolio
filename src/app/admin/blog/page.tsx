'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

export default function BlogAdmin() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handlePublish = () => {
    console.log('pub', { title, content })
  }

  const handleSaveDraft = () => {
    console.log('draft', { title, content })
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
              className="mt-1 h-[calc(100vh-300px)]"
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
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSaveDraft} variant="outline" className="flex-1">
              Save Draft
            </Button>
            <Button onClick={handlePublish} className="flex-1">
              Publish
            </Button>
          </div>
        </div>
        <div className="border rounded-lg p-4 prose prose-sm max-w-none h-[calc(100vh-100px)] overflow-auto">
          <h1>{title}</h1>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}