'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { Slider } from '~/components/ui/slider'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Badge } from '~/components/ui/badge'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Save, RotateCcw, Eye, Settings, Palette, Zap } from 'lucide-react'
import { updateMainGalleryConfig, resetMainGalleryConfig } from '~/lib/actions/gallery-config'
import { HeroImageSelector } from '~/components/image-gallery/hero-image-selector'
import type { MainGalleryConfig } from '~/lib/types/gallery-config'
import type { PortfolioImageData } from '~/lib/types/image'

interface GalleryConfigurationProps {
  config: MainGalleryConfig
  onConfigChange: (config: MainGalleryConfig) => void
  isPreviewMode?: boolean
  availableImages?: PortfolioImageData[]
}

export function GalleryConfiguration({ config, onConfigChange, isPreviewMode = false, availableImages = [] }: GalleryConfigurationProps) {
  const [localConfig, setLocalConfig] = useState<MainGalleryConfig>(config)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Update local config when prop changes
  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  // Real-time preview - call onConfigChange when local config changes
  useEffect(() => {
    if (isPreviewMode) {
      onConfigChange(localConfig)
    }
  }, [localConfig, onConfigChange, isPreviewMode])

  const updateConfig = (updates: Partial<MainGalleryConfig>) => {
    const newConfig = { ...localConfig, ...updates }
    setLocalConfig(newConfig)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const result = await updateMainGalleryConfig(localConfig)
      if (result.success) {
        setSaveStatus('success')
        onConfigChange(localConfig)
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    
    try {
      const result = await resetMainGalleryConfig()
      if (result.success) {
        // Reset local config to defaults
        const defaultConfig = {
          ...localConfig,
          layout: 'masonry' as const,
          gridVariant: 'standard' as const,
          columnsMobile: 1,
          columnsTablet: 2,
          columnsDesktop: 3,
          columnsLarge: 4,
          gapSize: 'medium' as const,
          borderRadius: 'medium' as const,
          aspectRatio: 'auto' as const,
          enableHeroImage: false,
          heroImageId: null,
          heroImagePosition: 'top' as const,
          heroImageSize: 'large' as const,
          heroImageStyle: 'featured' as const,
          enableStaggered: false,
          enablePrioritySort: false,
          priorityMode: 'order' as const,
          showImageTitles: true,
          showImageDescriptions: false,
          showImageMetadata: false,
          enableLightbox: true,
          enableInfiniteScroll: false,
          imagesPerPage: 50,
          enableAnimations: true,
          animationType: 'fade' as const,
          hoverEffect: 'zoom' as const,
          backgroundColor: 'default' as const,
          overlayColor: 'black' as const,
          overlayOpacity: 50,
          enableLazyLoading: true,
          imageQuality: 'auto' as const,
          enableProgressiveLoading: true,
        }
        setLocalConfig(defaultConfig)
        onConfigChange(defaultConfig)
      }
    } catch (error) {
      console.error('Error resetting config:', error)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gallery Configuration</h2>
          <p className="text-muted-foreground">Customize your main gallery layout and appearance</p>
        </div>
        <div className="flex items-center gap-2">
          {isPreviewMode && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Live Preview
            </Badge>
          )}
          {saveStatus === 'success' && (
            <Badge variant="default" className="bg-green-500">
              Saved!
            </Badge>
          )}
          {saveStatus === 'error' && (
            <Badge variant="destructive">
              Save Failed
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={isResetting} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          {isResetting ? 'Resetting...' : 'Reset to Defaults'}
        </Button>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="layout" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Display
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Style
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Layout Type</CardTitle>
                <CardDescription>Choose how images are arranged</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="layout">Layout</Label>
                  <Select value={localConfig.layout} onValueChange={(value) => updateConfig({ layout: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masonry">Masonry</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="horizontal-masonry">Horizontal Masonry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {localConfig.layout === 'grid' && (
                  <div>
                    <Label htmlFor="gridVariant">Grid Variant</Label>
                    <Select value={localConfig.gridVariant || 'standard'} onValueChange={(value) => updateConfig({ gridVariant: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="wide">Wide</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Columns</CardTitle>
                <CardDescription>Number of columns per screen size</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Mobile: {localConfig.columnsMobile}</Label>
                  <Slider
                    value={[localConfig.columnsMobile]}
                    onValueChange={(value) => updateConfig({ columnsMobile: value[0] })}
                    min={1}
                    max={3}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Tablet: {localConfig.columnsTablet}</Label>
                  <Slider
                    value={[localConfig.columnsTablet]}
                    onValueChange={(value) => updateConfig({ columnsTablet: value[0] })}
                    min={1}
                    max={4}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Desktop: {localConfig.columnsDesktop}</Label>
                  <Slider
                    value={[localConfig.columnsDesktop]}
                    onValueChange={(value) => updateConfig({ columnsDesktop: value[0] })}
                    min={1}
                    max={6}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Large: {localConfig.columnsLarge}</Label>
                  <Slider
                    value={[localConfig.columnsLarge]}
                    onValueChange={(value) => updateConfig({ columnsLarge: value[0] })}
                    min={1}
                    max={8}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hero Image Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Image</CardTitle>
              <CardDescription>Feature a prominent image at the top</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={localConfig.enableHeroImage}
                  onCheckedChange={(checked) => updateConfig({ enableHeroImage: checked })}
                />
                <Label>Enable Hero Image</Label>
              </div>

              {localConfig.enableHeroImage && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="heroImageSize">Size</Label>
                      <Select value={localConfig.heroImageSize || 'large'} onValueChange={(value) => updateConfig({ heroImageSize: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="xl">Extra Large</SelectItem>
                          <SelectItem value="full">Full Screen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="heroImageStyle">Style</Label>
                      <Select value={localConfig.heroImageStyle || 'featured'} onValueChange={(value) => updateConfig({ heroImageStyle: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="featured">Featured</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="showcase">Showcase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="heroImagePosition">Position</Label>
                      <Select value={localConfig.heroImagePosition || 'top'} onValueChange={(value) => updateConfig({ heroImagePosition: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Hero Image Selector */}
                  <HeroImageSelector
                    images={availableImages}
                    selectedImageId={localConfig.heroImageId}
                    onImageSelect={(imageId) => updateConfig({ heroImageId: imageId })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Image Information</CardTitle>
                <CardDescription>Control what information is shown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.showImageTitles}
                    onCheckedChange={(checked) => updateConfig({ showImageTitles: checked })}
                  />
                  <Label>Show Image Titles</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.showImageDescriptions}
                    onCheckedChange={(checked) => updateConfig({ showImageDescriptions: checked })}
                  />
                  <Label>Show Image Descriptions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.showImageMetadata}
                    onCheckedChange={(checked) => updateConfig({ showImageMetadata: checked })}
                  />
                  <Label>Show Image Metadata</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.enableLightbox}
                    onCheckedChange={(checked) => updateConfig({ enableLightbox: checked })}
                  />
                  <Label>Enable Lightbox</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pagination</CardTitle>
                <CardDescription>Control how many images are loaded</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.enableInfiniteScroll}
                    onCheckedChange={(checked) => updateConfig({ enableInfiniteScroll: checked })}
                  />
                  <Label>Enable Infinite Scroll</Label>
                </div>
                <div>
                  <Label>Images per Page: {localConfig.imagesPerPage}</Label>
                  <Slider
                    value={[localConfig.imagesPerPage]}
                    onValueChange={(value) => updateConfig({ imagesPerPage: value[0] })}
                    min={10}
                    max={200}
                    step={10}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spacing & Layout</CardTitle>
                <CardDescription>Visual spacing and appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gapSize">Gap Size</Label>
                  <Select value={localConfig.gapSize} onValueChange={(value) => updateConfig({ gapSize: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <Select value={localConfig.borderRadius || 'medium'} onValueChange={(value) => updateConfig({ borderRadius: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="full">Full (Circle)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                  <Select value={localConfig.aspectRatio || 'auto'} onValueChange={(value) => updateConfig({ aspectRatio: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                      <SelectItem value="landscape">Landscape (4:3)</SelectItem>
                      <SelectItem value="golden">Golden Ratio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Animations & Effects</CardTitle>
                <CardDescription>Visual effects and transitions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.enableAnimations}
                    onCheckedChange={(checked) => updateConfig({ enableAnimations: checked })}
                  />
                  <Label>Enable Animations</Label>
                </div>
                <div>
                  <Label htmlFor="hoverEffect">Hover Effect</Label>
                  <Select value={localConfig.hoverEffect || 'zoom'} onValueChange={(value) => updateConfig({ hoverEffect: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="overlay">Overlay</SelectItem>
                      <SelectItem value="lift">Lift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Overlay Opacity: {localConfig.overlayOpacity}%</Label>
                  <Slider
                    value={[localConfig.overlayOpacity]}
                    onValueChange={(value) => updateConfig({ overlayOpacity: value[0] })}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loading & Performance</CardTitle>
              <CardDescription>Optimize loading and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.enableLazyLoading}
                    onCheckedChange={(checked) => updateConfig({ enableLazyLoading: checked })}
                  />
                  <Label>Enable Lazy Loading</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.enableProgressiveLoading}
                    onCheckedChange={(checked) => updateConfig({ enableProgressiveLoading: checked })}
                  />
                  <Label>Progressive Loading</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="imageQuality">Image Quality</Label>
                <Select value={localConfig.imageQuality || 'auto'} onValueChange={(value) => updateConfig({ imageQuality: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Faster)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Better Quality)</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              Performance settings help optimize your gallery for different devices and connection speeds. 
              Lazy loading and progressive loading can significantly improve initial page load times.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}