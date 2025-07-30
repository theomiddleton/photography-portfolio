'use client'

import { useState } from 'react'
import { Frame } from '~/components/store/frame/frame'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Input } from '~/components/ui/input'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { cn } from '~/lib/utils'

export function FrameDemo() {
  const [frameStyle, setFrameStyle] = useState<
    'classic' | 'modern' | 'floating' | 'walnut' | 'oak' | 'mahogany' | 'pine'
  >('walnut')
  const [matColor, setMatColor] = useState<'white' | 'ivory' | 'black' | 'none'>('white')
  const [frameWidth, setFrameWidth] = useState<'narrow' | 'medium' | 'wide'>('medium')
  const [imageUrl, setImageUrl] = useState(
    'https://img.theomiddleton.me/5ddbd35c-6bc2-48ac-8afe-1b4e6f0d22e1.jpg',
  )
  const [imageError, setImageError] = useState(false)

  // Add new state for image dimensions
  const [imageDimensions, setImageDimensions] = useState({ width: 600, height: 400 })

  // Modify the validateImage function to return dimensions
  const validateImage = (url: string): Promise<{ isValid: boolean, width: number, height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ isValid: true, width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => resolve({ isValid: false, width: 600, height: 400 })
      img.src = url
    })
  }

  const handleImageUrlChange = async (url: string) => {
    setImageUrl(url)
    if (url) {
      const { isValid, width, height } = await validateImage(url)
      setImageError(!isValid)
      if (isValid) {
        setImageDimensions({ width, height })
      }
    } else {
      setImageError(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Art Frame Preview</h1>

          <div className="grid gap-8 md:grid-cols-2 items-start">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="Enter image URL..."
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                />
                {imageError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Unable to load image. Please check the URL and ensure it&apos;s publicly accessible.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label>Frame Style</Label>
                <Select value={frameStyle} onValueChange={(value: typeof frameStyle) => setFrameStyle(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frame style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classic Black</SelectItem>
                    <SelectItem value="modern">Modern White</SelectItem>
                    <SelectItem value="floating">Floating</SelectItem>
                    <SelectItem value="walnut">Walnut Wood</SelectItem>
                    <SelectItem value="oak">Oak Wood</SelectItem>
                    <SelectItem value="mahogany">Mahogany Wood</SelectItem>
                    <SelectItem value="pine">Pine Wood</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mat Color</Label>
                <Select value={matColor} onValueChange={(value: typeof matColor) => setMatColor(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mat color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="ivory">Ivory</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="none">No Mat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Frame Width</Label>
                <RadioGroup
                  value={frameWidth}
                  onValueChange={(value: typeof frameWidth) => setFrameWidth(value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="narrow" id="narrow" />
                    <Label htmlFor="narrow">Narrow</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wide" id="wide" />
                    <Label htmlFor="wide">Wide</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-8">
              <Frame
                src={imageUrl}
                alt="Framed artwork"
                width={imageDimensions.width}
                height={imageDimensions.height}
                frameStyle={frameStyle}
                matColor={matColor}
                frameWidth={frameWidth}
                className="w-full"
              />

              {/* Wall Preview */}
              <div className="relative w-full aspect-3/2 rounded-lg overflow-hidden shadow-xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f')`
                  }}
                />
                <div className="absolute inset-0 bg-black/5" />
                
                {/* Frame container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className={cn(
                      '-translate-y-[5%]',
                      // Adjust width based on orientation
                      imageDimensions.height > imageDimensions.width 
                        ? 'w-[16.67%]'  // Portrait: scaled for equal area
                        : 'w-[25%]'     // Landscape: original size
                    )}
                    style={{
                      transform: imageDimensions.height > imageDimensions.width
                        ? 'translate(-10%, -15%)'  // Adjusted for portrait
                        : 'translate(-10%, -20%)', // Original landscape position
                      marginLeft: '-50px',
                      marginTop: imageDimensions.height > imageDimensions.width ? '-50px' : '-70px',
                    }}
                  >
                    <Frame
                      src={imageUrl}
                      alt="Framed artwork on wall"
                      width={imageDimensions.width}
                      height={imageDimensions.height}
                      frameStyle={frameStyle}
                      matColor={matColor}
                      frameWidth={frameWidth}
                      className="w-full shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

