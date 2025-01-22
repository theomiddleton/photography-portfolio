'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import type { videos } from '~/server/db/schema'
import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '~/lib/slugify'

type Video = typeof videos.$inferSelect

const videoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  hlsUrl: z.string().url('Must be a valid URL'),
  thumbnail: z.string().url('Must be a valid URL').optional(),
  duration: z.string().optional(),
  isVisible: z.boolean().default(true)
})

export type VideoFormData = z.infer<typeof videoSchema>

type VideoFormProps = {
  video?: Video,
    action: (data: VideoFormData) => Promise<void>
}

export function VideoForm({ video, action }: VideoFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: video?.title ?? '',
      slug: video?.slug ?? '',
      description: video?.description ?? '',
      hlsUrl: video?.hlsUrl ?? '',
      thumbnail: video?.thumbnail ?? '',
      duration: video?.duration ?? '',
      isVisible: video?.isVisible ?? true
    }
  })

  // Watch the title field
  const title = useWatch({
    control: form.control,
    name: 'title'
  })

  // Update slug when title changes
  useEffect(() => {
    if (title && !video) { // Only auto-update if it's a new video
      form.setValue('slug', slugify(title), {
        shouldValidate: true
      })
    }
  }, [title, form, video])



  return (
    <Form {...form}>
      <form action={ async (formData: FormData) => {
            const data = form.getValues()
            startTransition(async () => {
                await action(data)
                router.refresh()
            })
        }} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The URL-friendly version of the title
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hlsUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HLS URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Example: &quot;1:30:00&quot; for 1 hour 30 minutes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
          <Button type="submit" disabled={isPending}>
              {isPending ? 'Loading...' : video ? 'Update Video' : 'Create Video'}
          </Button>
      </form>
    </Form>
  )
}