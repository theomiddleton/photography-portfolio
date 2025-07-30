'use client'

import * as React from 'react'
import { Plus, Upload, Eye, EyeOff } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { createTheme } from '~/server/actions/themes'
import { toast } from 'sonner'

interface ThemeCreatorProps {
  onThemeCreated?: () => void
}

export function ThemeCreator({ onThemeCreated }: ThemeCreatorProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [preview, setPreview] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    cssContent: '',
    primaryColor: '#000000',
    secondaryColor: '#666666',
    accentColor: '#0066cc',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      
      const result = await createTheme({
        name: formData.name,
        slug,
        description: formData.description,
        cssContent: formData.cssContent,
        previewColors: {
          primary: formData.primaryColor,
          secondary: formData.secondaryColor,
          accent: formData.accentColor,
          background: formData.backgroundColor,
          foreground: formData.foregroundColor,
        },
      })

      if (result.success) {
        toast.success('Theme created successfully')
        setFormData({
          name: '',
          description: '',
          cssContent: '',
          primaryColor: '#000000',
          secondaryColor: '#666666',
          accentColor: '#0066cc',
          backgroundColor: '#ffffff',
          foregroundColor: '#000000',
        })
        setOpen(false)
        onThemeCreated?.()
      } else {
        toast.error(result.error || 'Failed to create theme')
      }
    } catch (error) {
      console.error('Error creating theme:', error)
      toast.error('Failed to create theme')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'text/css') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setFormData(prev => ({ ...prev, cssContent: content }))
      }
      reader.readAsText(file)
    } else {
      toast.error('Please select a valid CSS file')
    }
  }

  const togglePreview = () => {
    if (!preview && formData.cssContent) {
      // Apply preview styles
      const existingPreview = document.getElementById('theme-preview-styles')
      if (existingPreview) existingPreview.remove()

      const style = document.createElement('style')
      style.id = 'theme-preview-styles'
      style.textContent = formData.cssContent
      document.head.appendChild(style)
      setPreview(true)
    } else {
      // Remove preview styles
      const existingPreview = document.getElementById('theme-preview-styles')
      if (existingPreview) existingPreview.remove()
      setPreview(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Theme</DialogTitle>
          <DialogDescription>
            Create a new theme by providing CSS content that will replace the entire site styling.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Theme Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Theme"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A beautiful custom theme for my site"
                />
              </div>

              {/* Color Swatches */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Color Preview</CardTitle>
                  <CardDescription className="text-xs">
                    Set colors for the theme swatch preview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="primaryColor" className="text-xs">Primary</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="primaryColor"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondaryColor" className="text-xs">Secondary</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="secondaryColor"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          type="text"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="accentColor" className="text-xs">Accent</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="accentColor"
                          value={formData.accentColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          type="text"
                          value={formData.accentColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="backgroundColor" className="text-xs">Background</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="backgroundColor"
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          type="text"
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CSS Content */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="cssContent">CSS Content</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={togglePreview}
                      disabled={!formData.cssContent}
                    >
                      {preview ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                      {preview ? 'Stop Preview' : 'Preview'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('css-file-input')?.click()}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload CSS
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="cssContent"
                  value={formData.cssContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, cssContent: e.target.value }))}
                  placeholder={`/* Paste your complete CSS here */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  /* ... more CSS variables ... */
}

.dark {
  --background: 240 10% 3.9%;
  /* ... dark mode variables ... */
}

/* Your custom styles */`}
                  className="min-h-[300px] font-mono text-sm"
                  required
                />
                <input
                  type="file"
                  id="css-file-input"
                  accept=".css"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Theme'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}