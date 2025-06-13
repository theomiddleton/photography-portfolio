import * as React from 'react'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

interface ImageSizeControlsProps {
  width?: number
  height?: number
  onSizeChange: (width: number, height: number) => void
  aspectRatio?: number
  className?: string
}

export function ImageSizeControls({
  width = 400,
  height = 300,
  onSizeChange,
  aspectRatio = 1.33,
  className,
}: ImageSizeControlsProps) {
  const [localWidth, setLocalWidth] = React.useState(width.toString())
  const [localHeight, setLocalHeight] = React.useState(height.toString())
  const [isLinked, setIsLinked] = React.useState(true)

  React.useEffect(() => {
    setLocalWidth(width.toString())
    setLocalHeight(height.toString())
  }, [width, height])

  const handleWidthChange = (value: string) => {
    setLocalWidth(value)
    const numValue = parseInt(value, 10)
    if (isNaN(numValue) || numValue <= 0) return

    if (isLinked && aspectRatio) {
      const newHeight = Math.round(numValue / aspectRatio)
      setLocalHeight(newHeight.toString())
      onSizeChange(numValue, newHeight)
    } else {
      onSizeChange(numValue, height)
    }
  }

  const handleHeightChange = (value: string) => {
    setLocalHeight(value)
    const numValue = parseInt(value, 10)
    if (isNaN(numValue) || numValue <= 0) return

    if (isLinked && aspectRatio) {
      const newWidth = Math.round(numValue * aspectRatio)
      setLocalWidth(newWidth.toString())
      onSizeChange(newWidth, numValue)
    } else {
      onSizeChange(width, numValue)
    }
  }

  const resetToOriginal = () => {
    const defaultWidth = 600
    const defaultHeight = Math.round(defaultWidth / aspectRatio)
    setLocalWidth(defaultWidth.toString())
    setLocalHeight(defaultHeight.toString())
    onSizeChange(defaultWidth, defaultHeight)
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-gray-50 p-3',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Image Size</span>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToOriginal}
          className="h-6 px-2 text-xs"
        >
          Reset
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label htmlFor="width" className="text-xs">
            Width (px)
          </Label>
          <Input
            id="width"
            type="number"
            value={localWidth}
            onChange={(e) => handleWidthChange(e.target.value)}
            className="h-8 text-sm"
            min="50"
            max="1200"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsLinked(!isLinked)}
          className={cn(
            'mt-4 rounded p-1 text-xs transition-colors',
            isLinked
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
          )}
          title={isLinked ? 'Unlink dimensions' : 'Link dimensions'}
        >
          {isLinked ? '🔗' : '💔'}
        </button>

        <div className="flex-1">
          <Label htmlFor="height" className="text-xs">
            Height (px)
          </Label>
          <Input
            id="height"
            type="number"
            value={localHeight}
            onChange={(e) => handleHeightChange(e.target.value)}
            className="h-8 text-sm"
            min="25"
            max="800"
          />
        </div>
      </div>

      <div className="text-center text-xs text-gray-500">
        Aspect ratio: {aspectRatio.toFixed(2)}:1
      </div>
    </div>
  )
}

export default ImageSizeControls
