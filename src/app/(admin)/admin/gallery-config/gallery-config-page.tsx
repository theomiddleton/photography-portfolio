'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Badge } from '~/components/ui/badge'
import { Settings, Eye, Split } from 'lucide-react'
import { GalleryConfiguration } from '~/components/image-gallery/gallery-configuration'
import { EnhancedImageGallery } from '~/components/image-gallery/enhanced-image-gallery'
import type { MainGalleryConfig } from '~/lib/types/gallery-config'
import type { PortfolioImageData } from '~/lib/types/image'

interface GalleryConfigurationPageProps {
  initialConfig: MainGalleryConfig
  sampleImages: PortfolioImageData[]
}

export function GalleryConfigurationPage({ initialConfig, sampleImages }: GalleryConfigurationPageProps) {
  const [currentConfig, setCurrentConfig] = useState<MainGalleryConfig>(initialConfig)
  const [previewConfig, setPreviewConfig] = useState<MainGalleryConfig>(initialConfig)
  const [viewMode, setViewMode] = useState<'split' | 'config' | 'preview'>('split')

  const handleConfigChange = (newConfig: MainGalleryConfig) => {
    setPreviewConfig(newConfig)
  }

  const handleSaveSuccess = (newConfig: MainGalleryConfig) => {
    setCurrentConfig(newConfig)
    setPreviewConfig(newConfig)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Main Gallery Configuration</h1>
          <p className="text-muted-foreground">
            Customize the appearance and behavior of your main portfolio gallery
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Live Configuration
          </Badge>
        </div>
      </div>

      {/* View Mode Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            View Mode
          </CardTitle>
          <CardDescription>
            Choose how you want to view the configuration interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'split' ? 'default' : 'outline'}
              onClick={() => setViewMode('split')}
              className="flex items-center gap-2"
            >
              <Split className="h-4 w-4" />
              Split View
            </Button>
            <Button
              variant={viewMode === 'config' ? 'default' : 'outline'}
              onClick={() => setViewMode('config')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configuration Only
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              onClick={() => setViewMode('preview')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Make changes to see them reflected in real-time in the preview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GalleryConfiguration
                  config={currentConfig}
                  onConfigChange={handleConfigChange}
                  isPreviewMode={true}
                  availableImages={sampleImages}
                />
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See how your gallery will look with the current configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted/20">
                  <EnhancedImageGallery
                    initialImages={sampleImages}
                    config={previewConfig}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {viewMode === 'config' && (
        <GalleryConfiguration
          config={currentConfig}
          onConfigChange={handleSaveSuccess}
          isPreviewMode={false}
          availableImages={sampleImages}
        />
      )}

      {viewMode === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>Gallery Preview</CardTitle>
            <CardDescription>
              Preview of your main gallery with current configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-background">
              <EnhancedImageGallery
                initialImages={sampleImages}
                config={currentConfig}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}