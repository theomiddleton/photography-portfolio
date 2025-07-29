'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Crown, X } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Badge } from '~/components/ui/badge'
import type { PortfolioImageData } from '~/lib/types/image'

interface HeroImageSelectorProps {
  images: PortfolioImageData[]
  selectedImageId: number | null
  onImageSelect: (imageId: number | null) => void
}

export function HeroImageSelector({ images, selectedImageId, onImageSelect }: HeroImageSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const selectedImage = images.find(img => img.id === selectedImageId)

  const handleImageSelect = (imageId: number) => {
    if (selectedImageId === imageId) {
      onImageSelect(null) // Deselect if clicking the same image
    } else {
      onImageSelect(imageId)
    }
  }

  const handleClearSelection = () => {
    onImageSelect(null)
    setIsExpanded(false)
  }

  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <p className="text-muted-foreground text-sm">No images available to select as hero</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Current Selection Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Hero Image Selection
          </CardTitle>
          <CardDescription>
            Choose an image to feature prominently at the top of your gallery
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedImage ? (
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={selectedImage.fileUrl}
                  alt={selectedImage.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <div className="absolute top-1 right-1">
                  <Badge variant="default" className="bg-yellow-500 text-yellow-50 px-1 py-0">
                    <Crown className="h-3 w-3" />
                  </Badge>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{selectedImage.name}</h4>
                {selectedImage.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {selectedImage.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    Change Selection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelection}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Crown className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-3">No hero image selected</p>
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                Select Hero Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Selection Grid */}
      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Hero Image</CardTitle>
            <CardDescription>
              Click on an image to select it as your hero image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative aspect-square rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                      selectedImageId === image.id
                        ? 'border-yellow-500 ring-2 ring-yellow-200'
                        : 'border-muted hover:border-primary'
                    }`}
                    onClick={() => handleImageSelect(image.id)}
                  >
                    <div className="relative w-full h-full rounded-md overflow-hidden">
                      <Image
                        src={image.fileUrl}
                        alt={image.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      
                      {/* Selection Indicator */}
                      {selectedImageId === image.id && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-yellow-500 text-white rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                      
                      {/* Hero Badge */}
                      {selectedImageId === image.id && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="default" className="bg-yellow-500 text-yellow-50 px-1 py-0">
                            <Crown className="h-3 w-3" />
                          </Badge>
                        </div>
                      )}
                      
                      {/* Image Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-white text-xs font-medium truncate">
                          {image.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedImage ? `Selected: ${selectedImage.name}` : 'No image selected'}
              </p>
              <Button
                variant="outline"
                onClick={() => setIsExpanded(false)}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}