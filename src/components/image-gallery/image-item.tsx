'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  MoreVertical,
  Trash2,
  ZoomIn,
} from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import type { PortfolioImageData } from '~/lib/types/image'
import { ImagePreviewModal } from '~/components/image-gallery/image-preview-modal'

interface ImageItemProps {
  image: PortfolioImageData
  index?: number
  isSelected?: boolean
  onSelect?: () => void
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  showOrderControls?: boolean
  compact?: boolean
  isProcessing?: boolean
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
  isProcessing = false,
}: ImageItemProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <Card
        className={`overflow-hidden transition-all duration-200 ${
          !image.visible ? 'opacity-60' : ''
        } ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={onSelect}
      >
        <div className="group relative aspect-auto w-full overflow-hidden">
          <Image
            src={image.fileUrl || '/placeholder.svg'}
            alt={image.name}
            width={600}
            height={400}
            className="h-auto w-full object-cover"
          />

          {showOrderControls && typeof index === 'number' && (
            <Badge
              variant="secondary"
              className="absolute left-2 top-2 bg-background/80 backdrop-blur-xs"
            >
              {index + 1}
            </Badge>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/30 group-hover:opacity-100">
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

        <CardContent className={compact ? 'p-2' : 'p-3'}>
          <div className="mb-2 flex items-start justify-between">
            <div>
              <h3 className="truncate text-base font-medium">{image.name}</h3>
              {!compact && (
                <p className="text-xs text-muted-foreground">
                  {image.tags}
                </p>
              )}
            </div>

            {showOrderControls && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                  disabled={isProcessing}
                >
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
                      disabled={isProcessing}
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
                      disabled={isProcessing}
                    >
                      <ArrowDown className="mr-2 h-4 w-4" />
                      <span>Move down</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(String(image.id))
                    }}
                    disabled={isProcessing}
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
                disabled={isProcessing}
                onCheckedChange={(e) => {
                  // e.stopPropagation()
                  onToggleVisibility(String(image.id))
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <Label
                htmlFor={`visibility-${image.id}`}
                className="text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {image.visible ? (
                  <span className="flex items-center">
                    <Eye className="mr-1 h-3 w-3" /> Visible
                  </span>
                ) : (
                  <span className="flex items-center">
                    <EyeOff className="mr-1 h-3 w-3" /> Hidden
                  </span>
                )}
              </Label>
            </div>

            {!showOrderControls && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(String(image.id))
                }}
                disabled={isProcessing}
                aria-label="Delete image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ImagePreviewModal
        image={image}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  )
}
