'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

import { UploadImg } from '~/components/upload-img'
import { readAbout, saveAbout } from '~/lib/actions/about'

interface FeedbackState {
  type: 'success' | 'error' | null
  message: string
}

export default function AboutEditor() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' })
  const [uploadedImages, setUploadedImages] = useState<{ name: string, url: string }[]>([])

  useEffect(() => {
    fetchAbout()
  }, [])

  const fetchAbout = async () => {
    try {
      const about = await readAbout()
      if (about) {
        setTitle(about.title)
        setContent(about.content)
        setUploadedImages(about.images || [])
      }
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'An error occurred. Please try again.' 
      })
    }
  }
    
  const handleSave = async () => {
    setIsLoading(true)
    setFeedback({ type: null, message: '' })
    try {
      const data = {
        title,
        content,
        images: uploadedImages
      }
      const result = await saveAbout(data)
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

  const handleImageUpload = (image: { name: string, url: string }) => {
    setUploadedImages(prev => [...prev, image])
  }

  return (
    <div className="container mx-auto p-4 min-h-[150vh]">
      <h1 className="text-2xl font-bold mb-4">
        About Editor
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              About Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={title}
              className="mt-1"
              aria-label="About title"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              About Me Contents
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={content}
              className="mt-1 h-[calc(100vh-500px)]"
              aria-label="About content"
            />
          </div>
          <div className="flex space-x-2">
            {/* <Button onClick={() => handleSave(true)} variant="outline" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save Draft'}
            </Button> */}
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
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Upload About Me Assets</h2>
            <UploadImg bucket='about' onImageUpload={handleImageUpload} />
          </div>
          {uploadedImages.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Uploaded Images</h3>
              <ul className="space-y-2">
                {uploadedImages.map((img, index) => (
                  <li key={index}>{img.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="border rounded-lg p-4 prose prose-sm max-w-none h-[calc(100vh-100px)] overflow-auto">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}