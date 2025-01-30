'use client'

import { useState } from 'react'
import { FrameWrapper, type FrameStyle } from '~/components/store/frame/frame-options'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Input } from '~/components/ui/input'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '~/components/ui/alert'

export function FrameDemo() {
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('classic')
  const [matColor, setMatColor] = useState<'white' | 'ivory' | 'black' | 'none'>('ivory')
  const [frameWidth, setFrameWidth] = useState<'narrow' | 'medium' | 'wide'>('medium')
  const [imageUrl, setImageUrl] = useState('')
  const [imageError, setImageError] = useState(false)

  const validateImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    })
  }

  const handleImageUrlChange = async (url: string) => {
    setImageUrl(url)
    if (url) {
      const isValid = await validateImage(url)
      setImageError(!isValid)
    } else {
      setImageError(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Art Frame Preview</h1>

          <div className="grid gap-4 mb-8 md:grid-cols-2 items-start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="Enter image URL..."
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full"
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
                <Select value={frameStyle} onValueChange={(value: FrameStyle) => setFrameStyle(value)}>
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
                <Select
                  value={matColor}
                  onValueChange={(value: "white" | "ivory" | "black" | "none") => setMatColor(value)}
                >
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
                  onValueChange={(value: "narrow" | "medium" | "wide") => setFrameWidth(value)}
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

            <div className="grid gap-8">
              {/* Landscape image example (3:2 ratio) */}
              <FrameWrapper
                src={imageUrl || "/placeholder.svg?height=400&width=600"}
                alt="Landscape artwork"
                width={600}
                height={400}
                frameStyle={frameStyle}
                matColor={matColor}
                frameWidth={frameWidth}
                className="w-full max-w-sm mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

