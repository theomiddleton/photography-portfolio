'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Switch } from '~/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import type { customPages } from '~/server/db/schema'
import { MDXPreview } from '~/components/pages/mdx-preview'
import { UploadImg } from '~/components/upload-img'
import { ImageSelect } from '~/components/image-select'
import { slugify } from '~/lib/slugify'

export type CustomPage = typeof customPages.$inferSelect

interface PageFormProps {
  page?: CustomPage
  action: (formData: FormData) => Promise<void>
}

interface ImageData {
  id: string
  name: string
  url: string
  selected?: boolean
}

export function PageForm({ page, action }: PageFormProps) {
  const router = useRouter()
  const [content, setContent] = useState(page?.content ?? '')
  const [images, setImages] = useState<ImageData[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState(page?.title ?? '')
  const [slug, setSlug] = useState(page?.slug ?? '')
  const [isPublished, setIsPublished] = useState(page?.isPublished ?? false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      formData.set('content', content)
      formData.set('title', title)
      formData.set('slug', slug)
      formData.set('isPublished', isPublished.toString())
      formData.set('images', JSON.stringify(images.filter(img => img.selected)))
      await action(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (image: { name: string, url: string }) => {
    const newImage = {
      id: Date.now().toString(),
      name: image.name,
      url: image.url
    }
    setImages(prev => [...prev, newImage])
  }
  
  const handleImageSelect = (selected: string[]) => {
    setImages(prevImages => prevImages.map(img => ({
      ...img,
      selected: selected.includes(img.id)
    })))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-24">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (!page?.slug) { 
                setSlug(slugify(e.target.value))
              }
            }}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            pattern="[a-zA-Z0-9-]+"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content (MDX)</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="min-h-[300px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isPublished"
            name="isPublished"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
          <Label htmlFor="isPublished">Published</Label>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload Images</h3>
          <UploadImg bucket="custom" onImageUpload={handleImageUpload} />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Selected Images</h4>
            {/* <ImageSelect 
              images={images} 
              onSelect={handleImageSelect}
            /> */}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : page ? 'Update' : 'Create'} Page
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preview</h3>
        <MDXPreview content={content} />
      </div>
    </div>
  )
}