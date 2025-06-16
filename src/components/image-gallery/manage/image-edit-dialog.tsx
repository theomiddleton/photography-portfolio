'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
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
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { updateImageMetadata } from '~/lib/actions/gallery'

interface GalleryImage {
  id: string
  galleryId: string
  uuid: string
  fileName: string
  fileUrl: string
  name: string
  description: string | null
  alt: string | null
  caption: string | null
  tags: string | null
  metadata: Record<string, any> | null
  order: number
  uploadedAt: Date
}

interface ImageEditDialogProps {
  image: GalleryImage | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageUpdate: (updatedImage: GalleryImage) => void
}

const imageEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.string().optional(),
})

type ImageEditData = z.infer<typeof imageEditSchema>

export function ImageEditDialog({ image, open, onOpenChange, onImageUpdate }: ImageEditDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<ImageEditData>({
    resolver: zodResolver(imageEditSchema),
    defaultValues: {
      name: image?.name || '',
      description: image?.description || '',
      alt: image?.alt || '',
      caption: image?.caption || '',
      tags: image?.tags || '',
    },
  })

  // Reset form when image changes
  useEffect(() => {
    if (image) {
      form.reset({
        name: image.name,
        description: image.description || '',
        alt: image.alt || '',
        caption: image.caption || '',
        tags: image.tags || '',
      })
    }
  }, [image, form])

  const onSubmit = async (data: ImageEditData) => {
    if (!image) return

    try {
      setLoading(true)
      
      const result = await updateImageMetadata(image.id, {
        name: data.name,
        description: data.description || null,
        alt: data.alt || null,
        caption: data.caption || null,
        tags: data.tags || null,
      })

      if (result.error) {
        toast.error('Failed to update image details')
      } else {
        toast.success('Image details updated successfully')
        onImageUpdate({
          ...image,
          ...data,
          description: data.description || null,
          alt: data.alt || null,
          caption: data.caption || null,
          tags: data.tags || null,
        })
        onOpenChange(false)
      }
    } catch (error) {
      toast.error('Failed to update image details')
    } finally {
      setLoading(false)
    }
  }

  if (!image) return null

  const tagList = image.tags ? image.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Image Details</DialogTitle>
          <DialogDescription>
            Update the name, description, caption, alt text, and tags for this image.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
            <img
              src={image.fileUrl}
              alt={image.alt || image.name}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {image.fileName} • Uploaded {new Date(image.uploadedAt).toLocaleDateString()}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a caption for this image" {...field} />
                  </FormControl>
                  <FormDescription>
                    Brief text that appears with the image in the gallery
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
                    <Textarea 
                      placeholder="Enter a detailed description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description for SEO and accessibility
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alt Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe what's in the image" {...field} />
                  </FormControl>
                  <FormDescription>
                    Alternative text for screen readers and accessibility
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tags separated by commas" {...field} />
                  </FormControl>
                  <FormDescription>
                    Separate multiple tags with commas (e.g., landscape, sunset, nature)
                  </FormDescription>
                  {tagList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tagList.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
