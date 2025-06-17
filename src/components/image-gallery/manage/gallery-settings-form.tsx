'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

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
import { Switch } from '~/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { updateGallery } from '~/lib/actions/gallery/gallery'
import { gallerySchema } from '~/lib/types/galleryType'
import { galleryTemplates } from '~/config/gallery-templates'

const formSchema = gallerySchema

interface Gallery {
  id: string
  title: string
  slug: string
  description: string | null
  layout: string
  columns: { mobile: number; tablet: number; desktop: number }
  isPublic: boolean
  showInNav: boolean
  category: string
  tags: string | null
  template: string
  allowEmbedding: boolean
  embedPassword: string | null
  isPasswordProtected: boolean
  galleryPassword: string | null
  passwordCookieDuration: number
  shareableLink: string | null
  viewCount: number
  createdAt: Date
  updatedAt: Date
  images: Array<{
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
  }>
}

interface GallerySettingsFormProps {
  gallery: Gallery
  onUpdate: (updatedGallery: Partial<Gallery>) => void
}

export function GallerySettingsForm({ gallery, onUpdate }: GallerySettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: gallery.title,
      slug: gallery.slug,
      description: gallery.description || '',
      layout: gallery.layout as 'masonry' | 'grid' | 'square' | 'list',
      columns: gallery.columns,
      isPublic: gallery.isPublic,
      showInNav: gallery.showInNav,
      category: gallery.category || 'general',
      tags: gallery.tags || '',
      template: gallery.template as any || 'custom',
      allowEmbedding: gallery.allowEmbedding ?? true,
      embedPassword: gallery.embedPassword || '',
      isPasswordProtected: gallery.isPasswordProtected ?? false,
      galleryPassword: '', // Always empty for security
      passwordCookieDuration: gallery.passwordCookieDuration || 30,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await updateGallery(gallery.id, values)
      
      if (result.error) {
        toast.error(typeof result.error === 'string' ? result.error : 'Failed to update gallery')
      } else {
        toast.success('Gallery updated successfully')
        onUpdate(values as Partial<Gallery>)
      }
    } catch (error) {
      toast.error('Failed to update gallery')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallery Settings</CardTitle>
        <CardDescription>
          Configure how your gallery appears and behaves
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="My Amazing Gallery" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your gallery as it will appear to visitors
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="my-amazing-gallery" {...field} />
                  </FormControl>
                  <FormDescription>
                    The URL path for your gallery: /g/{field.value || 'gallery-slug'}
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
                      placeholder="A beautiful collection of..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description that will appear on the gallery page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="layout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Layout Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a layout" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="masonry">Masonry</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="square">Square Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How images will be displayed in the gallery
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="columns.mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Columns</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Column</SelectItem>
                        <SelectItem value="2">2 Columns</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="columns.tablet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tablet Columns</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Column</SelectItem>
                        <SelectItem value="2">2 Columns</SelectItem>
                        <SelectItem value="3">3 Columns</SelectItem>
                        <SelectItem value="4">4 Columns</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="columns.desktop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desktop Columns</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Column</SelectItem>
                        <SelectItem value="2">2 Columns</SelectItem>
                        <SelectItem value="3">3 Columns</SelectItem>
                        <SelectItem value="4">4 Columns</SelectItem>
                        <SelectItem value="5">5 Columns</SelectItem>
                        <SelectItem value="6">6 Columns</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                        <SelectItem value="street">Street Photography</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="nature">Nature</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {galleryTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Predefined layout and styling for different use cases
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value.split(',').map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowEmbedding"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Allow Embedding</FormLabel>
                    <FormDescription>
                      Allow this gallery to be embedded on other websites
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('allowEmbedding') && (
              <FormField
                control={form.control}
                name="embedPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Embed Password (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Enter password for embedded gallery"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      If set, users will need this password to view the embedded gallery
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {gallery.shareableLink && (
              <div className="space-y-2">
                <FormLabel>Shareable Link</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    value={gallery.shareableLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(gallery.shareableLink!)
                      toast.success('Link copied to clipboard')
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <FormDescription>
                  Use this link to share your gallery directly
                </FormDescription>
              </div>
            )}

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Gallery</FormLabel>
                    <FormDescription>
                      Make this gallery publicly viewable at /g/{form.watch('slug') || 'gallery-slug'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showInNav"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Show in Navigation</FormLabel>
                    <FormDescription>
                      Include this gallery in the main navigation menu (disabled for password-protected galleries)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value && !form.watch('isPasswordProtected')}
                      onCheckedChange={field.onChange}
                      disabled={form.watch('isPasswordProtected')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPasswordProtected"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Password Protected</FormLabel>
                    <FormDescription>
                      Require a password to view this gallery (overrides public setting)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (checked) {
                          // When enabling password protection, automatically disable showInNav
                          form.setValue('showInNav', false)
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('isPasswordProtected') && (
              <>
                {gallery.galleryPassword && (
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <FormLabel className="text-base">Current Password</FormLabel>
                        <FormDescription>
                          Enter current password to view or change it
                        </FormDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {showCurrentPassword && (
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="galleryPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {gallery.galleryPassword ? 'New Password' : 'Gallery Password'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder={gallery.galleryPassword ? 'Enter new password' : 'Enter password for gallery access'}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {gallery.galleryPassword 
                          ? 'Leave empty to keep current password unchanged'
                          : 'Users will need this password to view the gallery'
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passwordCookieDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Cookie Duration (Days)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 Day</SelectItem>
                          <SelectItem value="7">1 Week</SelectItem>
                          <SelectItem value="30">1 Month</SelectItem>
                          <SelectItem value="90">3 Months</SelectItem>
                          <SelectItem value="365">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How long users stay logged in after entering the correct password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
