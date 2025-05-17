'use client'

import Image from 'next/image'
import { X } from 'lucide-react'

import { Dialog, DialogContent } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import type { ImageData } from '~/lib/types/image'

interface ImagePreviewModalProps {
  image: ImageData
  isOpen: boolean
  onClose: () => void
}

export function ImagePreviewModal({ image, isOpen, onClose }: ImagePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 rounded-full bg-background/80 hover:bg-background"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="p-1">
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
          <div className="p-4">
            <h2 className="text-xl font-medium">{image.title}</h2>
            <p className="text-sm text-muted-foreground">{image.category}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
