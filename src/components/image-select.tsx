'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '~/lib/utils'
import { CheckCircle } from 'lucide-react'
import { ScrollArea } from '~/components/ui/scroll-area'

interface ImageFile {
  id: string
  name: string
  url: string
}

interface ImageSelectProps {
  images: ImageFile[]
  onSelect: (selectedImages: string[]) => void
}

export function ImageSelect({ images, onSelect }: ImageSelectProps) {
  const [selectedImages, setSelectedImages] = React.useState<string[]>([])

  const toggleImageSelection = (id: string) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((imageId) => imageId !== id) : [...prev, id]
    )
  }

  React.useEffect(() => {
    onSelect(selectedImages)
  }, [selectedImages, onSelect])

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={cn(
              'relative group cursor-pointer rounded-lg overflow-hidden',
              'transition-all duration-300 ease-in-out',
              'hover:ring-2 hover:ring-primary',
              selectedImages.includes(image.id) && 'ring-2 ring-primary'
            )}
            onClick={() => toggleImageSelection(image.id)}
          >
            <Image
              src={image.url}
              alt={image.name}
              width={200}
              height={150}
              className="object-cover w-full h-auto aspect-4/3"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {selectedImages.includes(image.id) && (
              <CheckCircle className="absolute top-2 right-2 text-primary-foreground w-6 h-6" />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-sm truncate">
              {image.name}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}