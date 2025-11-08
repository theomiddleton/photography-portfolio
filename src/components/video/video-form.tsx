'use client'

import { useForm } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useState } from 'react'
import type { Video } from '~/server/db/schema'

const videoFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  hlsUrl: z.string().url('Must be a valid URL'),
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  duration: z.coerce.number().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']),
  password: z.string().optional().or(z.literal('')),
  resolution: z.string().optional().or(z.literal('')),
  fps: z.coerce.number().optional(),
  seoTitle: z.string().optional().or(z.literal('')),
  seoDescription: z.string().optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
})

export type VideoFormData = z.infer<typeof videoFormSchema>

interface VideoFormProps {
  video?: Video
  onSubmit: (data: VideoFormData) => Promise<void>
  isSubmitting?: boolean
}

export function VideoForm({ video, onSubmit, isSubmitting = false }: VideoFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: video?.title ?? '',
      slug: video?.slug ?? '',
      description: video?.description ?? '',
      hlsUrl: video?.hlsUrl ?? '',
      thumbnailUrl: video?.thumbnailUrl ?? '',
      duration: video?.duration ?? undefined,
      visibility: video?.visibility ?? 'public',
      password: '',
      resolution: video?.resolution ?? '',
      fps: video?.fps ?? undefined,
      seoTitle: video?.seoTitle ?? '',
      seoDescription: video?.seoDescription ?? '',
      tags: video?.tags ?? '',
    },
  })

  const visibility = form.watch('visibility')

  const handleSubmit = async (data: VideoFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="My Amazing Video" />
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
                <Input {...field} placeholder="my-amazing-video" />
              </FormControl>
              <FormDescription>
                URL-friendly identifier (lowercase, numbers, and hyphens only)
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
                <Textarea {...field} placeholder="Video description..." rows={4} />
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
                <Input {...field} placeholder="https://example.com/video.m3u8" />
              </FormControl>
              <FormDescription>
                URL to the HLS manifest file (.m3u8)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/thumbnail.jpg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (seconds)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="120" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FPS</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="30" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="resolution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resolution</FormLabel>
              <FormControl>
                <Input {...field} placeholder="1920x1080" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public - Visible to everyone</SelectItem>
                  <SelectItem value="unlisted">Unlisted - Accessible via direct link</SelectItem>
                  <SelectItem value="private">Private - Requires password</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {visibility === 'private' && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type={showPassword ? 'text' : 'password'}
                    placeholder={video ? 'Leave blank to keep current password' : 'Enter password'}
                  />
                </FormControl>
                <FormDescription>
                  {video ? 'Leave blank to keep the current password' : 'Required for private videos'}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="ml-2 h-auto p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input {...field} placeholder="travel, nature, documentary" />
              </FormControl>
              <FormDescription>
                Comma-separated tags
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seoTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Custom title for search engines" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seoDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Description for search engines..." rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : video ? 'Update Video' : 'Create Video'}
        </Button>
      </form>
    </Form>
  )
}
