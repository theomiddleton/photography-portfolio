'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeOffIcon,
  ExternalLinkIcon,
  LayoutGridIcon
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Switch } from '~/components/ui/switch'
import { 
  getMultiGalleryPages, 
  createMultiGalleryPage, 
  updateMultiGalleryPage, 
  deleteMultiGalleryPage 
} from '~/lib/actions/multi-gallery'
import type { MultiGalleryPage, CreateMultiGalleryPageRequest } from '~/lib/types/multi-gallery'

export function MultiGalleryPageList() {
  const [pages, setPages] = useState<MultiGalleryPage[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<MultiGalleryPage | null>(null)
  const [formData, setFormData] = useState<CreateMultiGalleryPageRequest>({
    slug: '',
    title: '',
    description: '',
    isPublic: false,
    showInNav: false,
    seoTitle: '',
    seoDescription: '',
  })
  const router = useRouter()

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    try {
      setLoading(true)
      const result = await getMultiGalleryPages()
      if (result.success && result.data) {
        setPages(result.data)
      } else {
        toast.error('Failed to load pages')
      }
    } catch (error) {
      toast.error('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.slug || !formData.title) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      const result = await createMultiGalleryPage(formData)
      
      if (result.success && result.data) {
        toast.success('Page created successfully')
        setCreateDialogOpen(false)
        setFormData({
          slug: '',
          title: '',
          description: '',
          isPublic: false,
          showInNav: false,
          seoTitle: '',
          seoDescription: '',
        })
        loadPages()
        router.push(`/admin/multi-galleries/${result.data.id}`)
      } else {
        toast.error(result.error || 'Failed to create page')
      }
    } catch (error) {
      toast.error('Failed to create page')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingPage || !formData.slug || !formData.title) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      const result = await updateMultiGalleryPage({
        id: editingPage.id,
        ...formData,
      })
      
      if (result.success) {
        toast.success('Page updated successfully')
        setEditingPage(null)
        loadPages()
      } else {
        toast.error(result.error || 'Failed to update page')
      }
    } catch (error) {
      toast.error('Failed to update page')
    }
  }

  const handleDelete = async (page: MultiGalleryPage) => {
    if (!confirm(`Are you sure you want to delete "${page.title}"? This will delete all sections and separators.`)) {
      return
    }

    try {
      const result = await deleteMultiGalleryPage(page.id)
      
      if (result.success) {
        toast.success('Page deleted successfully')
        loadPages()
      } else {
        toast.error(result.error || 'Failed to delete page')
      }
    } catch (error) {
      toast.error('Failed to delete page')
    }
  }

  const handleToggleVisibility = async (page: MultiGalleryPage) => {
    try {
      const result = await updateMultiGalleryPage({
        id: page.id,
        isPublic: !page.isPublic,
      })
      
      if (result.success) {
        toast.success(`Page ${page.isPublic ? 'hidden' : 'published'}`)
        loadPages()
      } else {
        toast.error('Failed to update page visibility')
      }
    } catch (error) {
      toast.error('Failed to update page visibility')
    }
  }

  const openEditDialog = (page: MultiGalleryPage) => {
    setEditingPage(page)
    setFormData({
      slug: page.slug,
      title: page.title,
      description: page.description || '',
      isPublic: page.isPublic,
      showInNav: page.showInNav,
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
    })
  }

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      description: '',
      isPublic: false,
      showInNav: false,
      seoTitle: '',
      seoDescription: '',
    })
    setEditingPage(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Button */}
      <div className="flex justify-end">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Multi-Gallery Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Multi-Gallery Page</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Page title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  placeholder="url-slug"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic">Make public</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="showInNav"
                  checked={formData.showInNav}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInNav: checked }))}
                />
                <Label htmlFor="showInNav">Show in navigation</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Page</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayoutGridIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No multi-gallery pages yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Create your first multi-gallery page to combine different gallery layouts in a single page
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card key={page.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate">{page.title}</CardTitle>
                    <CardDescription className="mt-1">
                      /mg/{page.slug}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Badge variant={page.isPublic ? 'default' : 'secondary'} className="text-xs">
                      {page.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
                {page.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {page.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/multi-galleries/${page.id}`}>
                      <EditIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  
                  {page.isPublic && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/mg/${page.slug}`} target="_blank">
                        <ExternalLinkIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleVisibility(page)}
                  >
                    {page.isPublic ? (
                      <EyeOffIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <EyeIcon className="h-4 w-4 mr-1" />
                    )}
                    {page.isPublic ? 'Hide' : 'Publish'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(page)}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(page)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPage} onOpenChange={(open) => !open && setEditingPage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Page title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-slug">URL Slug *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                placeholder="url-slug"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label htmlFor="edit-isPublic">Make public</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-showInNav"
                checked={formData.showInNav}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInNav: checked }))}
              />
              <Label htmlFor="edit-showInNav">Show in navigation</Label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingPage(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Page</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}