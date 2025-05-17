'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUp, Eye, EyeOff, MoreVertical, Trash2, ZoomIn } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import type { ImageData } from '~/lib/types/image'
import { ImagePreviewModal } from '~/components/image-gallery/image-preview-modal'

interface ImageItemProps {
  image: ImageData
  index?: number
  isSelected?: boolean
  onSelect?: () => void
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  showOrderControls?: boolean
  compact?: boolean
}

export function ImageItem({
  image,
  index,
  isSelected = false,
  onSelect,
  onToggleVisibility,
  onDelete,
  onMoveUp,
  onMoveDown,
  showOrderControls = false,
  compact = false,
}: ImageItemProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <Card
        className={`overflow-hidden transition-all duration-200 ${
          !image.visible ? "opacity-60" : ""
        } ${isSelected ? "ring-2 ring-primary" : ""}`}
        onClick={onSelect}
      >
        <div className="relative aspect-auto w-full overflow-hidden group">
          <Image
            src={image.src || "/placeholder.svg"}
            alt={image.alt}
            width={600}
            height={400}
            className="object-cover w-full h-auto"
          />

          {showOrderControls && typeof index === "number" && (
            <Badge variant="secondary" className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">
              {index + 1}
            </Badge>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                setShowPreview(true)
              }}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <CardContent className={compact ? "p-2" : "p-3"}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-base truncate">{image.title}</h3>
              {!compact && <p className="text-xs text-muted-foreground">{image.category}</p>}
            </div>

            {showOrderControls && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onMoveUp && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveUp()
                      }}
                    >
                      <ArrowUp className="mr-2 h-4 w-4" />
                      <span>Move up</span>
                    </DropdownMenuItem>
                  )}
                  {onMoveDown && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveDown()
                      }}
                    >
                      <ArrowDown className="mr-2 h-4 w-4" />
                      <span>Move down</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(image.id)
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id={`visibility-${image.id}`}
                checked={image.visible}
                onCheckedChange={(e) => {
                  e.stopPropagation()
                  onToggleVisibility(image.id)
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <Label htmlFor={`visibility-${image.id}`} className="text-xs" onClick={(e) => e.stopPropagation()}>
                {image.visible ? (
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" /> Visible
                  </span>
                ) : (
                  <span className="flex items-center">
                    <EyeOff className="h-3 w-3 mr-1" /> Hidden
                  </span>
                )}
              </Label>
            </div>

            {!showOrderControls && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(image.id)
                }}
                aria-label="Delete image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ImagePreviewModal image={image} isOpen={showPreview} onClose={() => setShowPreview(false)} />
    </>
  )
}
