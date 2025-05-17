'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Input } from '~/components/ui/input'
import type { ImageData } from '~/lib/types/image'

interface ListViewProps {
  images: ImageData[]
  selectedImage: string | null
  onSelect: (id: string) => void
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, toPosition: number) => void
}

export function ListView({ images, selectedImage, onSelect, onToggleVisibility, onDelete, onMove }: ListViewProps) {
  const [editingPosition, setEditingPosition] = useState<{ id: string; value: string } | null>(null)

  const handlePositionChange = (id: string, position: number) => {
    // Convert to zero-based index
    const targetPosition = Math.max(0, Math.min(position - 1, images.length - 1))
    onMove(id, targetPosition)
    setEditingPosition(null)
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Position</TableHead>
            <TableHead className="w-[100px]">Preview</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="w-[100px]">Visibility</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((image, index) => (
            <TableRow
              key={image.id}
              className={selectedImage === image.id ? "bg-muted/50" : undefined}
              onClick={() => onSelect(image.id)}
            >
              <TableCell>
                {editingPosition && editingPosition.id === image.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const newPosition = Number.parseInt(editingPosition.value)
                      if (!isNaN(newPosition)) {
                        handlePositionChange(image.id, newPosition)
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Input
                      type="number"
                      min="1"
                      max={images.length}
                      value={editingPosition.value}
                      onChange={(e) => setEditingPosition({ id: image.id, value: e.target.value })}
                      className="w-16 h-8"
                      autoFocus
                      onBlur={() => {
                        const newPosition = Number.parseInt(editingPosition.value)
                        if (!isNaN(newPosition)) {
                          handlePositionChange(image.id, newPosition)
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
                    className="h-8 px-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingPosition({ id: image.id, value: (index + 1).toString() })
                    }}
                  >
                    {index + 1}
                  </Button>
                )}
              </TableCell>
              <TableCell>
                <div className="relative w-16 h-12">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover rounded-sm"
                  />
                </div>
              </TableCell>
              <TableCell>{image.title}</TableCell>
              <TableCell>{image.category}</TableCell>
              <TableCell>
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    id={`list-visibility-${image.id}`}
                    checked={image.visible}
                    onCheckedChange={() => onToggleVisibility(image.id)}
                  />
                  <span className="ml-2 text-xs">
                    {image.visible ? (
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" /> Visible
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <EyeOff className="h-3 w-3 mr-1" /> Hidden
                      </span>
                    )}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === 0}
                    onClick={() => onMove(image.id, index - 1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === images.length - 1}
                    onClick={() => onMove(image.id, index + 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
