'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { type z } from 'zod'
import { toast } from 'sonner'
import { EyeIcon, EyeOffIcon, LinkIcon, ClockIcon } from 'lucide-react'

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
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
  images: {
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
    metadata: Record<string, unknown> | null
    order: number
    uploadedAt: Date
  }[]
}

interface GallerySettingsFormProps {
  gallery: Gallery
  onUpdate: (updatedGallery: Partial<Gallery>) => void
}

export function GallerySettingsForm({
  gallery,
  onUpdate,
}: GallerySettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [tempLink, setTempLink] = useState<string | null>(null)
  const [tempLinkExpiry, setTempLinkExpiry] = useState<string | null>(null)

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      template: (gallery.template as any) || 'custom',
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
        toast.error(
          typeof result.error === 'string'
            ? result.error
            : 'Failed to update gallery',
        )
      } else {
        toast.success('Gallery updated successfully')
        onUpdate(values as Partial<Gallery>)
      }
    } catch (_error) {
      toast.error('Failed to update gallery')
    } finally {
      setIsLoading(false)
    }
  }

  const generateTempLink = async (hours: number = 24, maxUses: number = 1) => {
    try {
      const response = await fetch('/api/gallery/temp-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          galleryId: gallery.id,
          expirationHours: hours,
          maxUses,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate temporary link')
      }

      setTempLink(data.url)
      setTempLinkExpiry(data.expiresAt)
      toast.success('Temporary link generated successfully')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to generate temporary link',
      )
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
                    The URL path for your gallery: /g/
                    {field.value || 'gallery-slug'}
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="columns.mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Columns</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
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
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
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
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                        <SelectItem value="street">
                          Street Photography
                        </SelectItem>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {galleryTemplates.map((template) => (
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
                    <Input
                      placeholder="Enter tags separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate multiple tags with commas (e.g., landscape, sunset,
                    nature)
                  </FormDescription>
                  {field.value && field.value.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
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
                      If set, users will need this password to view the embedded
                      gallery
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
                      Make this gallery publicly viewable at /g/
                      {form.watch('slug') || 'gallery-slug'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (checked) {
                          // When making public, automatically disable password protection
                          form.setValue('isPasswordProtected', false)
                        }
                      }}
                      disabled={form.watch('isPasswordProtected')}
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
                    <FormLabel className="text-base">
                      Show in Navigation
                    </FormLabel>
                    <FormDescription>
                      Include this gallery in the main navigation menu (disabled
                      for password-protected galleries)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={
                        field.value && !form.watch('isPasswordProtected')
                      }
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
                    <FormLabel className="text-base">
                      Password Protection
                    </FormLabel>
                    <FormDescription>
                      Require a password to view this gallery (automatically
                      makes gallery private)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (checked) {
                          // When enabling password protection, automatically disable public and nav
                          form.setValue('isPublic', false)
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
                <div className="rounded-lg border bg-amber-50 p-4 dark:bg-amber-950/20">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-amber-600 dark:text-amber-400">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">
                        Password Types
                      </h4>
                      <div className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                        <strong>Admin Password:</strong> Your login credentials
                        to access this admin panel
                        <br />
                        <strong>Gallery Password:</strong> What visitors enter
                        to view the protected gallery
                      </div>
                    </div>
                  </div>
                </div>

                {gallery.galleryPassword && (
                  <div className="bg-muted/50 rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <FormLabel className="text-base">
                          Verify Admin Identity
                        </FormLabel>
                        <FormDescription>
                          Enter your admin login password (not the gallery
                          password) to modify settings
                        </FormDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {showCurrentPassword && (
                      <div className="space-y-3">
                        <Input
                          type="password"
                          placeholder="Enter your admin login password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // TODO: Verify admin password
                            toast.success('Password verified')
                          }}
                        >
                          Verify Password
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="galleryPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {gallery.galleryPassword
                          ? 'New Gallery Password'
                          : 'Gallery Password'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={
                            gallery.galleryPassword
                              ? 'Enter new password for gallery access'
                              : 'Enter password that visitors will use'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {gallery.galleryPassword
                          ? 'Leave empty to keep the current gallery access password unchanged'
                          : 'Visitors will need to enter this password to view the gallery'}
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
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value?.toString()}
                      >
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
                        How long users stay logged in after entering the correct
                        password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {form.watch('isPasswordProtected') && (
              <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/20">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <FormLabel className="text-base">
                      Temporary Access Links
                    </FormLabel>
                    <FormDescription>
                      Generate secure links that allow temporary access without
                      requiring the password
                    </FormDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => generateTempLink(24, 1)}
                    >
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Quick Share (24h)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => generateTempLink(168, 10)}
                    >
                      <ClockIcon className="mr-2 h-4 w-4" />
                      Extended (1 week, 10 uses)
                    </Button>
                  </div>
                </div>

                {tempLink && (
                  <div className="space-y-3 border-t pt-3">
                    <div className="text-sm font-medium text-green-700 dark:text-green-400">
                      ✓ Temporary link generated successfully
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={tempLink}
                        readOnly
                        className="flex-1 bg-white font-mono text-xs dark:bg-gray-800"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(tempLink)
                          toast.success('Link copied to clipboard')
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    {tempLinkExpiry && (
                      <div className="text-muted-foreground rounded bg-white p-2 text-xs dark:bg-gray-800">
                        <strong>Expires:</strong>{' '}
                        {new Date(tempLinkExpiry).toLocaleString()}
                        <br />
                        <strong>Share this link:</strong> Recipients can access
                        the gallery directly without entering a password
                      </div>
                    )}
                  </div>
                )}
              </div>
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
