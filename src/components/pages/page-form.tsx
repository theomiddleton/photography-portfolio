'use client'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Switch } from '~/components/ui/switch'
import type { customPages } from '~/server/db/schema'
import { useRouter } from 'next/navigation'

export type CustomPage = typeof customPages.$inferSelect
export type NewCustomPage = typeof customPages.$inferInsert

interface PageFormProps {
  page?: CustomPage
  action: (formData: FormData) => Promise<void>
}

export function PageForm({ page, action }: PageFormProps) {
  const router = useRouter()

  return (
    <form action={action} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={page?.title}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={page?.slug}
          required
          pattern="[a-zA-Z0-9-]+"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={page?.content}
          required
          className="min-h-[300px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublished"
          name="isPublished"
          defaultChecked={page?.isPublished}
        />
        <Label htmlFor="isPublished">Published</Label>
      </div>

      <div className="flex gap-4">
        <Button type="submit">
          {page ? 'Update' : 'Create'} Page
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
  )
}

