'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Switch } from '~/components/ui/switch'
import { Button } from '~/components/ui/button'
import { SimpleEditor } from '~/components/blog/editor'
import { slugify } from '~/lib/utils'
import { toast } from 'sonner'

interface BlogFormProps {
  initialContent?: any
  post?: {
    slug: string
    id: string
    title: string
    description: string
    content: string
    published: boolean
    publishedAt: Date
    authorId: number
    createdAt: Date
    updatedAt: Date
  }
}

export function BlogForm({ initialContent, post }: BlogFormProps) {
  const router = useRouter()
  const editorRef = React.useRef<any>(null)
  const [title, setTitle] = React.useState(post?.title ?? '')
  const [description, setDescription] = React.useState(post?.description ?? '')
  const [slug, setSlug] = React.useState(post?.slug ?? '')
  const [published, setPublished] = React.useState(post?.published ?? false)
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (title && !isSlugManuallyEdited && !post) {
      setSlug(slugify(title))
    }
  }, [title, isSlugManuallyEdited, post])

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true)
    setSlug(slugify(e.target.value))
  }

  const handleSubmit = async (isDraft: boolean) => {
    if (!title.trim() || !slug.trim()) {
      setError('Title and slug are required.')
      toast.error('Title and slug are required.')
      return
    }
    setError('')
    try {
      const endpoint = post ? `/api/blog/posts/${post.slug}` : '/api/blog/posts'
      const method = post ? 'PUT' : 'POST'

      // Get the current editor content
      const editorContent = editorRef.current?.editor?.getJSON() || {}
      console.log('Editor Content: ', editorContent)

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          slug,
          content: JSON.stringify(editorContent),
          published: !isDraft,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${post ? 'update' : 'create'} post`)
      }

      const data = await response.json()
      
      // Show appropriate toast based on action
      if (post) {
        toast.success(
          isDraft ? 'Draft saved successfully' : 'Post updated successfully',
        )
      } else {
        toast.success(
          isDraft
            ? 'Draft created successfully'
            : 'Post published successfully',
        )
      }
      router.push(`/admin/blog/edit/${data.slug}`)
    } catch (error) {
      console.error(`Failed to ${post ? 'update' : 'create'} post:`, error)
      toast.error(
        `Failed to ${post ? 'update' : 'create'} post. Please try again.`,
      )
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
            placeholder="Enter your blog post title"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a brief description of your post"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={handleSlugChange}
            placeholder="Enter URL slug"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={setPublished}
          />
          <Label htmlFor="published">Published</Label>
        </div>
      </div>

      <Card>
        <CardContent>
          <SimpleEditor ref={editorRef} initialContent={initialContent} />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => handleSubmit(true)}
          disabled={!title.trim() || !slug.trim()}
        >
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={!title.trim() || !slug.trim()}
        >
          {published ? 'Publish' : 'Save'}
        </Button>
      </div>
      {error && <div className="mb-2 text-sm text-red-500">{error}</div>}
    </div>
  )
}
