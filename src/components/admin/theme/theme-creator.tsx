'use client'

import * as React from 'react'
import { Plus, Upload, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink, Info } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
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
import { 
  validateThemeCSS, 
  validateColorFormat, 
  supportedColorFormats,
  themeSourceRecommendations,
  type ValidationResult 
} from '~/lib/theme-validation'

interface ThemeCreatorProps {
  onThemeCreated?: () => void
}

export function ThemeCreator({ onThemeCreated }: ThemeCreatorProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [preview, setPreview] = React.useState(false)
  const [validation, setValidation] = React.useState<ValidationResult | null>(null)
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

  // Validate CSS content when it changes
  React.useEffect(() => {
    if (formData.cssContent.trim()) {
      const result = validateThemeCSS(formData.cssContent)
      setValidation(result)
    } else {
      setValidation(null)
    }
  }, [formData.cssContent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate before submission
    const validationResult = validateThemeCSS(formData.cssContent)
    if (!validationResult.isValid) {
      toast.error('Please fix CSS validation errors before submitting')
      return
    }
    
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
        setValidation(null)
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
      // Validate before preview
      const validationResult = validateThemeCSS(formData.cssContent)
      if (!validationResult.isValid) {
        toast.error('Please fix CSS validation errors before previewing')
        return
      }

      // Apply preview styles
      const existingPreview = document.getElementById('theme-preview-styles')
      if (existingPreview) existingPreview.remove()

      const style = document.createElement('style')
      style.id = 'theme-preview-styles'
      style.textContent = formData.cssContent
      document.head.appendChild(style)
      setPreview(true)
      toast.success('Theme preview applied')
    } else {
      // Remove preview styles
      const existingPreview = document.getElementById('theme-preview-styles')
      if (existingPreview) existingPreview.remove()
      setPreview(false)
      toast.success('Theme preview removed')
    }
  }

  const handleColorChange = (colorKey: keyof typeof formData, value: string) => {
    const colorValidation = validateColorFormat(value)
    if (!colorValidation.isValid && value.trim() !== '') {
      // Don't block input, just show warning in validation
    }
    setFormData(prev => ({ ...prev, [colorKey]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Theme</DialogTitle>
          <DialogDescription>
            Create a new theme by providing CSS content that will replace the entire site styling.
          </DialogDescription>
        </DialogHeader>

        {/* Guides Section */}
        <div className="space-y-4">
          {/* Color Format Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Supported Color Formats
              </CardTitle>
              <CardDescription>
                This theme system supports multiple color formats for maximum flexibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {supportedColorFormats.map((format) => (
                  <div key={format.format} className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">
                      {format.format}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm">{format.description}</p>
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {format.example}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Theme Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Where to Get Themes
              </CardTitle>
              <CardDescription>
                Recommended sources for high-quality themes and inspiration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {themeSourceRecommendations.map((source) => (
                  <div key={source.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{source.name}</h4>
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Feedback */}
          {validation && (
            <div className="space-y-2">
              {validation.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Validation Errors:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      {validation.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {validation.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warnings:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      {validation.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {validation.isValid && formData.cssContent.trim() && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    CSS validation passed! Theme is ready for preview and submission.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
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
                            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            type="text"
                            value={formData.primaryColor}
                            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                            className="flex-1 text-xs"
                            placeholder="e.g., #3b82f6, hsl(217, 91%, 60%)"
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
                            onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            type="text"
                            value={formData.secondaryColor}
                            onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                            className="flex-1 text-xs"
                            placeholder="e.g., #6b7280, rgb(107, 114, 128)"
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
                            onChange={(e) => handleColorChange('accentColor', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            type="text"
                            value={formData.accentColor}
                            onChange={(e) => handleColorChange('accentColor', e.target.value)}
                            className="flex-1 text-xs"
                            placeholder="e.g., #0066cc, oklch(0.7 0.15 264)"
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
                            onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            type="text"
                            value={formData.backgroundColor}
                            onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                            className="flex-1 text-xs"
                            placeholder="e.g., #ffffff, 0 0% 100%"
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
                      disabled={!formData.cssContent || (validation && !validation.isValid)}
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
            <Button 
              type="submit" 
              disabled={loading || (validation && !validation.isValid)}
            >
              {loading ? 'Creating...' : 'Create Theme'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}