'use client'

import { useState } from 'react'
import { updateGalleryConfig, type GalleryConfigData } from '~/lib/actions/gallery/gallery-config'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Loader2, Settings } from 'lucide-react'

interface GalleryConfigFormProps {
  initialConfig: GalleryConfigData
}

export function GalleryConfigForm({ initialConfig }: GalleryConfigFormProps) {
  const [config, setConfig] = useState<GalleryConfigData>(initialConfig)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const result = await updateGalleryConfig(config)

    if (result.success) {
      setMessage('Gallery configuration updated successfully!')
    } else {
      setMessage(result.error || 'Failed to update configuration')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Gallery Configuration</CardTitle>
            <CardDescription>
              Customize your image gallery layout and appearance
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Column Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Column Layout
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-columns">Mobile Columns</Label>
                    <Select
                      value={config.columnsMobile.toString()}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, columnsMobile: parseInt(value) }))}
                    >
                      <SelectTrigger id="mobile-columns">
                        <SelectValue placeholder="Select columns" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} Column{num > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tablet-columns">Tablet Columns</Label>
                    <Select
                      value={config.columnsTablet.toString()}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, columnsTablet: parseInt(value) }))}
                    >
                      <SelectTrigger id="tablet-columns">
                        <SelectValue placeholder="Select columns" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} Column{num > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desktop-columns">Desktop Columns</Label>
                    <Select
                      value={config.columnsDesktop.toString()}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, columnsDesktop: parseInt(value) }))}
                    >
                      <SelectTrigger id="desktop-columns">
                        <SelectValue placeholder="Select columns" />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} Column{num > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="large-columns">Large Screen Columns</Label>
                    <Select
                      value={config.columnsLarge.toString()}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, columnsLarge: parseInt(value) }))}
                    >
                      <SelectTrigger id="large-columns">
                        <SelectValue placeholder="Select columns" />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} Column{num > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Style Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Style Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gallery-style">Gallery Style</Label>
                    <Select
                      value={config.galleryStyle}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, galleryStyle: value as 'masonry' | 'grid' | 'justified' }))}
                    >
                      <SelectTrigger id="gallery-style">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masonry">Masonry (Pinterest-style)</SelectItem>
                        <SelectItem value="grid">Grid (Equal height)</SelectItem>
                        <SelectItem value="justified">Justified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gap-size">Gap Size</Label>
                    <Select
                      value={config.gapSize}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, gapSize: value as 'small' | 'medium' | 'large' }))}
                    >
                      <SelectTrigger id="gap-size">
                        <SelectValue placeholder="Select gap size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Configuration...
                    </>
                  ) : (
                    'Update Gallery Configuration'
                  )}
                </Button>
              </div>

              {/* Message Display */}
              {message && (
                <Alert className={message.includes('success') ? 'border-green-500/20 bg-green-500/10' : 'border-destructive/20 bg-destructive/10'}>
                  <AlertDescription className={message.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-destructive'}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}