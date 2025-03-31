'use client'
import { useState, useEffect, useCallback } from 'react'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote } from 'next-mdx-remote'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { UploadImg } from '~/components/upload-img'
import { readAbout, saveAbout } from '~/lib/actions/about'
import { ImageSelect } from '~/components/image-select'
import { components } from '~/components/pages/mdx-components/mdx-components'

interface FeedbackState {
  type: 'success' | 'error' | null
  message: string
}

interface ImageData {
  id: string
  name: string
  url: string
  selected?: boolean
}

export default function AboutEditor() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [compiledContent, setCompiledContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' })
  const [images, setImages] = useState<ImageData[]>([])

  const compileMdx = useCallback(async (mdxContent: string) => {
    try {
      const mdxSource = await serialize(mdxContent, {
        parseFrontmatter: false,
      })
      setCompiledContent(mdxSource)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'MDX compilation failed'
      })
    }
  }, [])
  
  useEffect(() => {
    if (content) {
      compileMdx(content)
    }
  }, [content, compileMdx])

  const fetchAbout = useCallback(async () => {
    try {
      const about = await readAbout()
      if (about) {
        setTitle(about.title)
        setContent(about.content)
        if (about.images) {
          setImages(about.images.map(img => ({
            id: img.id.toString(),
            name: img.name,
            url: img.url
          })))
        }
      }
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'An error occurred. Please try again.' 
      })
    }
  }, [])

  useEffect(() => {
    fetchAbout()
  }, [fetchAbout])

  const handleSave = async () => {
    setIsLoading(true)
    setFeedback({ type: null, message: '' })
    try {
      const data = {
        title,
        content,
        images: images.filter(img => img.selected).map(img => ({
          id: parseInt(img.id),
          name: img.name,
          url: img.url
        }))
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

  const handleImageUpload = useCallback((image: { name: string, url: string }) => {
    const newImage = {
      id: Date.now().toString(),
      name: image.name,
      url: image.url
    }
    setImages(prev => [...prev, newImage])
  }, [])
  
  const handleImageSelect = useCallback((selected: string[]) => {
    setImages(prevImages => prevImages.map(img => ({
      ...img,
      selected: selected.includes(img.id)
    })))
  }, [])

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
              placeholder="Loading title..."
              className="mt-1"
              aria-label="About title"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              About Me Contents (MDX)
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your MDX content here..."
              className="mt-1 h-[calc(100vh-500px)]"
              aria-label="About content"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSave} disabled={isLoading} className="flex-1">
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
        </div>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 prose prose-sm max-w-none h-[calc(100vh-400px)] overflow-auto">
            {compiledContent && (
              <MDXRemote {...compiledContent} components={components} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Select Images</h3>
            <ImageSelect 
              images={images} 
              onSelect={handleImageSelect}
            />
          </div>
        </div>
      </div>
    </div>
  )
}