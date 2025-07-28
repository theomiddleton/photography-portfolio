'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Switch } from '~/components/ui/switch'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { ScrollArea } from '~/components/ui/scroll-area'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '~/components/ui/alert-dialog'
import { 
  updateMultiGalleryPage, 
  createMultiGallerySection, 
  updateMultiGallerySection, 
  deleteMultiGallerySection,
  createMultiGallerySeparator
} from '~/lib/actions/multi-gallery'
import { 
  DEFAULT_SECTION_CONFIG,
  DEFAULT_SEPARATOR_CONFIG
} from '~/lib/types/multi-gallery'
import type { 
  MultiGalleryPageConfig, 
  MultiGallerySectionWithImages, 
  MultiGallerySeparatorWithConfig
} from '~/lib/types/multi-gallery'

interface MultiGalleryPageEditorProps {
  initialPage: MultiGalleryPageConfig
}

export function MultiGalleryPageEditor({ initialPage }: MultiGalleryPageEditorProps) {
  const router = useRouter()
  const [page, setPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('settings')

  // Page settings handlers
  const handlePageUpdate = useCallback(async (updates: Partial<MultiGalleryPageConfig>) => {
    setIsLoading(true)
    try {
      const result = await updateMultiGalleryPage({
        id: page.id,
        ...updates
      })

      if (result.success && result.data) {
        setPage(result.data)
        toast.success('Page updated successfully')
      } else {
        toast.error(result.error || 'Failed to update page')
      }
    } catch (error) {
      console.error('Error updating page:', error)
      toast.error('Failed to update page')
    } finally {
      setIsLoading(false)
    }
  }, [page.id])

  // Section handlers
  const handleAddSection = useCallback(async () => {
    setIsLoading(true)
    try {
      const newOrder = Math.max(...page.sections.map(s => s.order), 0) + 1
      const result = await createMultiGallerySection({
        pageId: page.id,
        order: newOrder,
        title: `Section ${newOrder}`,
        config: DEFAULT_SECTION_CONFIG,
        imageIds: []
      })

      if (result.success && result.data) {
        setPage(prev => ({
          ...prev,
          sections: [...prev.sections, result.data!]
        }))
        toast.success('Section added successfully')
      } else {
        toast.error(result.error || 'Failed to add section')
      }
    } catch (error) {
      console.error('Error adding section:', error)
      toast.error('Failed to add section')
    } finally {
      setIsLoading(false)
    }
  }, [page.id, page.sections])

  const handleUpdateSection = useCallback(async (sectionId: string, updates: Partial<MultiGallerySectionWithImages>) => {
    setIsLoading(true)
    try {
      const result = await updateMultiGallerySection({
        id: sectionId,
        ...updates
      })

      if (result.success && result.data) {
        setPage(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId ? result.data! : section
          )
        }))
        toast.success('Section updated successfully')
      } else {
        toast.error(result.error || 'Failed to update section')
      }
    } catch (error) {
      console.error('Error updating section:', error)
      toast.error('Failed to update section')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDeleteSection = useCallback(async (sectionId: string) => {
    setIsLoading(true)
    try {
      const result = await deleteMultiGallerySection(sectionId)

      if (result.success) {
        setPage(prev => ({
          ...prev,
          sections: prev.sections.filter(section => section.id !== sectionId)
        }))
        toast.success('Section deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete section')
      }
    } catch (error) {
      console.error('Error deleting section:', error)
      toast.error('Failed to delete section')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Separator handlers
  const handleAddSeparator = useCallback(async () => {
    setIsLoading(true)
    try {
      const newPosition = Math.max(...page.separators.map(s => s.position), 0) + 1
      const result = await createMultiGallerySeparator({
        pageId: page.id,
        position: newPosition,
        config: DEFAULT_SEPARATOR_CONFIG
      })

      if (result.success && result.data) {
        setPage(prev => ({
          ...prev,
          separators: [...prev.separators, result.data!]
        }))
        toast.success('Separator added successfully')
      } else {
        toast.error(result.error || 'Failed to add separator')
      }
    } catch (error) {
      console.error('Error adding separator:', error)
      toast.error('Failed to add separator')
    } finally {
      setIsLoading(false)
    }
  }, [page.id, page.separators])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="h-8 w-8 p-0"
            >
              ←
            </Button>
            <h1 className="text-2xl font-bold">Edit Multi-Gallery Page</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>/{page.slug}</span>
            <Badge variant={page.isPublic ? 'default' : 'secondary'}>
              {page.isPublic ? 'Public' : 'Draft'}
            </Badge>
            {page.showInNav && <Badge variant="outline">In Navigation</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.open(`/mg/${page.slug}`, '_blank')}
            disabled={!page.isPublic}
          >
            🔗 Preview
          </Button>
          <Button 
            onClick={() => handlePageUpdate({ isPublic: !page.isPublic })}
            disabled={isLoading}
          >
            {page.isPublic ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Page Settings</TabsTrigger>
          <TabsTrigger value="sections">
            Sections ({page.sections.length})
          </TabsTrigger>
          <TabsTrigger value="separators">
            Separators ({page.separators.length})
          </TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Page Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure the basic settings for your multi-gallery page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={page.title}
                    onChange={(e) => setPage(prev => ({ ...prev, title: e.target.value }))}
                    onBlur={() => handlePageUpdate({ title: page.title })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={page.slug}
                    onChange={(e) => setPage(prev => ({ ...prev, slug: e.target.value }))}
                    onBlur={() => handlePageUpdate({ slug: page.slug })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={page.description || ''}
                  onChange={(e) => setPage(prev => ({ ...prev, description: e.target.value }))}
                  onBlur={() => handlePageUpdate({ description: page.description })}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Visibility & Navigation</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this page visible to the public
                    </p>
                  </div>
                  <Switch
                    checked={page.isPublic}
                    onCheckedChange={(checked) => handlePageUpdate({ isPublic: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show in Navigation</Label>
                    <p className="text-sm text-muted-foreground">
                      Include this page in the main navigation menu
                    </p>
                  </div>
                  <Switch
                    checked={page.showInNav}
                    onCheckedChange={(checked) => handlePageUpdate({ showInNav: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">SEO Settings</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={page.seoTitle || ''}
                    onChange={(e) => setPage(prev => ({ ...prev, seoTitle: e.target.value }))}
                    onBlur={() => handlePageUpdate({ seoTitle: page.seoTitle })}
                    placeholder="Custom title for search engines"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={page.seoDescription || ''}
                    onChange={(e) => setPage(prev => ({ ...prev, seoDescription: e.target.value }))}
                    onBlur={() => handlePageUpdate({ seoDescription: page.seoDescription })}
                    placeholder="Description for search engines"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Gallery Sections</h2>
              <p className="text-sm text-muted-foreground">
                Create and manage different gallery sections for your page
              </p>
            </div>
            <Button onClick={handleAddSection} disabled={isLoading}>
              + Add Section
            </Button>
          </div>

          {page.sections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-4xl mb-4">📷</div>
                <h3 className="text-lg font-medium mb-2">No sections yet</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Create your first gallery section to start building your multi-gallery page
                </p>
                <Button onClick={handleAddSection} disabled={isLoading}>
                  + Add Your First Section
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {page.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      onUpdate={handleUpdateSection}
                      onDelete={handleDeleteSection}
                      isLoading={isLoading}
                    />
                  ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Separators Tab */}
        <TabsContent value="separators" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Page Separators</h2>
              <p className="text-sm text-muted-foreground">
                Add visual separators between sections
              </p>
            </div>
            <Button onClick={handleAddSeparator} disabled={isLoading}>
              + Add Separator
            </Button>
          </div>

          {page.separators.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-4xl mb-4">➖</div>
                <h3 className="text-lg font-medium mb-2">No separators yet</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Add separators to create visual breaks between your gallery sections
                </p>
                <Button onClick={handleAddSeparator} disabled={isLoading}>
                  + Add Your First Separator
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {page.separators
                .sort((a, b) => a.position - b.position)
                .map((separator) => (
                  <SeparatorCard
                    key={separator.id}
                    separator={separator}
                    isLoading={isLoading}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-lg font-medium mb-2">Live Preview</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Preview functionality will be implemented in the next phase
              </p>
              <Button 
                variant="outline"
                onClick={() => window.open(`/mg/${page.slug}`, '_blank')}
                disabled={!page.isPublic}
              >
                🔗 Open in New Tab
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Section Card Component
interface SectionCardProps {
  section: MultiGallerySectionWithImages
  onUpdate: (sectionId: string, updates: Partial<MultiGallerySectionWithImages>) => void
  onDelete: (sectionId: string) => void
  isLoading: boolean
}

function SectionCard({ section, onUpdate, onDelete, isLoading }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? '▼' : '▶'}
            </Button>
            <div>
              <CardTitle className="text-base">
                {section.title || `Section ${section.order}`}
              </CardTitle>
              <CardDescription>
                {section.description || `Layout: ${section.layout}`} • {section.images.length} images
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">Order: {section.order}</Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                  🗑️
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Section</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this section? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(section.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`section-title-${section.id}`}>Section Title</Label>
                <Input
                  id={`section-title-${section.id}`}
                  value={section.title || ''}
                  onChange={(e) => onUpdate(section.id, { title: e.target.value })}
                  placeholder="Enter section title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`section-order-${section.id}`}>Order</Label>
                <Input
                  id={`section-order-${section.id}`}
                  type="number"
                  value={section.order}
                  onChange={(e) => onUpdate(section.id, { order: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`section-description-${section.id}`}>Description</Label>
              <Textarea
                id={`section-description-${section.id}`}
                value={section.description || ''}
                onChange={(e) => onUpdate(section.id, { description: e.target.value })}
                placeholder="Enter section description"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Layout: {section.layout}</span>
              <span>•</span>
              <span>Images: {section.images.length}</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                ⚙️ Configure Layout
              </Button>
              <Button variant="outline" size="sm">
                📷 Manage Images
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Separator Card Component
interface SeparatorCardProps {
  separator: MultiGallerySeparatorWithConfig
  isLoading: boolean
}

function SeparatorCard({ separator, isLoading: _isLoading }: SeparatorCardProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">➖</span>
            <div>
              <p className="font-medium">Separator {separator.position}</p>
              <p className="text-sm text-muted-foreground">
                Type: {separator.config.type}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">Position: {separator.position}</Badge>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              ⚙️
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
              🗑️
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}