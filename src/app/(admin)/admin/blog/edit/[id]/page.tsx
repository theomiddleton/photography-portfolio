'use client'

import { useCallback, useEffect, useState } from 'react'
import { BlogEditor } from '~/components/blog/editor'
import { BlogPreview } from '~/components/blog/preview'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface BlogPostData {
  title: string
  description: string
  content: string
  published: boolean
}

export default function BlogPostEditor({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [data, setData] = useState<BlogPostData>({
    title: '',
    description: '',
    content: '',
    published: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/blog/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch post')
        const post = await response.json()
        setData(post)
      } catch (error) {
        toast.error('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [params.id, toast])

  const handleAutoSave = useCallback(async () => {
    if (saving) return

    try {
      setSaving(true)
      const response = await fetch(`/api/blog/${params.id}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save draft')

      toast('Draft saved')
    } catch (error) {
      toast.error('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }, [data, params.id, saving, toast])

  const handlePublish = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/blog/${params.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to publish post')

      toast('Post published successfully')
      router.push('/admin/blog')
    } catch (error) {
      toast.error('Failed to publish post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
        <div className="space-x-4">
          <Button variant="outline" onClick={handleAutoSave} disabled={saving}>
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={saving}>
            Publish
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Post title"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
        />
        <Textarea
          placeholder="Post description"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BlogEditor
          content={data.content}
          onChange={(content) => setData({ ...data, content })}
          onAutoSave={handleAutoSave}
        />
        <BlogPreview content={data.content} />
      </div>
    </div>
  )
}
