'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2, Calendar, Tag, Image as ImageIcon } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'
import type { PortfolioImageData } from '~/lib/types/image'

interface ListViewProps {
  isProcessing?: boolean
  images: PortfolioImageData[]
  selectedImage: string | null
  onSelect: (id: string) => void
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, toPosition: number) => void
}

export function ListView({
  images,
  selectedImage,
  onSelect,
  onToggleVisibility,
  onDelete,
  onMove,
  isProcessing = false,
}: ListViewProps) {
  const [editingPosition, setEditingPosition] = useState<{
    id: string
    value: string
  } | null>(null)

  const handlePositionChange = (id: string, position: number) => {
    // Convert to zero-based index
    const targetPosition = Math.max(
      0,
      Math.min(position - 1, images.length - 1),
    )
    onMove(id, targetPosition)
    setEditingPosition(null)
  }

  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return 'Unknown'
    const sizes = ['B', 'KB', 'MB', 'GB']
    let i = 0
    let size = sizeInBytes
    while (size >= 1024 && i < sizes.length - 1) {
      size /= 1024
      i++
    }
    return `${size.toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{images.length} images</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-green-600" />
            <span className="text-sm">
              {images.filter(img => img.visible).length} visible
            </span>
          </div>
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-orange-600" />
            <span className="text-sm">
              {images.filter(img => !img.visible).length} hidden
            </span>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          Total: {formatFileSize(images.reduce((sum, img) => sum + (img.fileSize || 0), 0))}
        </Badge>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Order</TableHead>
              <TableHead className="w-[120px]">Preview</TableHead>
              <TableHead>Name & Details</TableHead>
              <TableHead className="w-[120px]">Tags</TableHead>
              <TableHead className="w-[100px]">Upload Date</TableHead>
              <TableHead className="w-[80px]">Size</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {images.map((image, index) => (
              <TableRow
                key={image.id}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-muted/50',
                  selectedImage === String(image.id) ? 'bg-muted/80' : '',
                  !image.visible ? 'opacity-60' : ''
                )}
                onClick={() => onSelect(String(image.id))}
              >
                <TableCell>
                  {editingPosition && editingPosition.id === String(image.id) ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const newPosition = Number.parseInt(editingPosition.value)
                        if (!isNaN(newPosition)) {
                          handlePositionChange(String(image.id), newPosition)
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        type="number"
                        min="1"
                        max={images.length}
                        value={editingPosition.value}
                        onChange={(e) =>
                          setEditingPosition({
                            id: String(image.id),
                            value: e.target.value,
                          })
                        }
                        disabled={isProcessing}
                        className="h-8 w-16"
                        autoFocus
                        onBlur={() => {
                          const newPosition = Number.parseInt(
                            editingPosition.value,
                          )
                          if (!isNaN(newPosition)) {
                            handlePositionChange(String(image.id), newPosition)
                          } else {
                            setEditingPosition(null)
                          }
                        }}
                      />
                    </form>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 font-mono"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingPosition({
                          id: String(image.id),
                          value: (index + 1).toString(),
                        })
                      }}
                      disabled={isProcessing}
                    >
                      #{index + 1}
                    </Button>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="relative h-16 w-20 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={image.fileUrl || '/placeholder.svg'}
                      alt={image.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium truncate max-w-[200px]">{image.name}</p>
                    {image.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                        {image.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {image.tags ? (
                    <div className="flex flex-wrap gap-1">
                      {image.tags.split(',').slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                      {image.tags.split(',').length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{image.tags.split(',').length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No tags</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(image.uploadedAt.toISOString())}
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatFileSize(image.fileSize)}
                  </span>
                </TableCell>
                
                <TableCell>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch
                      id={`list-visibility-${image.id}`}
                      checked={image.visible}
                      onCheckedChange={() => onToggleVisibility(String(image.id))}
                      disabled={isProcessing}
                    />
                    <div className="flex items-center gap-1">
                      {image.visible ? (
                        <Eye className="h-3 w-3 text-green-600" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-orange-600" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {image.visible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === 0 || isProcessing}
                      onClick={() => onMove(String(image.id), index - 1)}
                      title="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === images.length - 1 || isProcessing}
                      onClick={() => onMove(String(image.id), index + 1)}
                      title="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(String(image.id))}
                      disabled={isProcessing}
                      title="Delete image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
