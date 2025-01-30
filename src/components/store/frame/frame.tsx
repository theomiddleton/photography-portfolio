import Image from 'next/image'
import { cn } from '~/lib/utils'

interface FrameProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  frameStyle?: 'classic' | 'modern' | 'floating' | 'walnut' | 'oak' | 'mahogany' | 'pine'
  matColor?: 'white' | 'ivory' | 'black' | 'none'
  frameWidth?: 'narrow' | 'medium' | 'wide'
}

export function Frame({
  src,
  alt,
  width,
  height,
  className,
  frameStyle = 'classic',
  matColor = 'white',
  frameWidth = 'medium',
}: FrameProps) {
  const frameStyles = {
    classic: 'bg-[#2d2d2d]',
    modern: 'bg-white',
    floating: 'bg-white',
    walnut: 'bg-[linear-gradient(110deg,#3E2723,#2D1810)]',
    oak: 'bg-[linear-gradient(110deg,#C4A484,#8B7355)]',
    mahogany: 'bg-[linear-gradient(110deg,#4A0404,#2B0000)]',
    pine: 'bg-[linear-gradient(110deg,#DEB887,#BC8F5E)]',
  }

  const matStyles = {
    white: 'bg-white',
    ivory: 'bg-[#FFFFF3]',
    black: 'bg-black',
    none: '',
  }

  const frameWidths = {
    narrow: 20,
    medium: 30,
    wide: 40,
  }

  const matWidths = {
    narrow: 16,
    medium: 24,
    wide: 32,
  }

  const isWooden = ['walnut', 'oak', 'mahogany', 'pine'].includes(frameStyle)
  const isFloating = frameStyle === 'floating'
  const frameThickness = frameWidths[frameWidth]
  const matThickness = matColor !== 'none' ? matWidths[frameWidth] : 0

  // Calculate aspect ratio for the container
  const aspectRatio = height / width
  const containerPadding = frameThickness * 2 + matThickness * 2

  return (
    <div
      className={cn("relative w-full", className)}
      style={{
        aspectRatio: `${width} / ${height}`,
        maxWidth: '100%',
        margin: '0 auto'
      }}
    >
      <div className="absolute inset-0">
        {/* Frame - constructed with borders */}
        <div className={cn("absolute inset-0 z-10", frameStyles[frameStyle], "shadow-[0_8px_16px_rgba(0,0,0,0.2)]")}>
          {/* Wood grain effect - only on frame borders */}
          {isWooden && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.2)]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)] bg-[length:4px_100%]" />
            </div>
          )}

          {/* Inner frame opening */}
          <div
            className="absolute bg-white"
            style={{
              top: frameThickness,
              right: frameThickness,
              bottom: frameThickness,
              left: frameThickness,
            }}
          />
        </div>

        {/* Mat - constructed with borders */}
        {matColor !== "none" && (
          <div
            className={cn("absolute z-20", matStyles[matColor], "shadow-[0_2px_8px_rgba(0,0,0,0.15)]")}
            style={{
              top: frameThickness,
              right: frameThickness,
              bottom: frameThickness,
              left: frameThickness,
            }}
          >
            {/* Mat opening */}
            <div
              className="absolute bg-white"
              style={{
                top: matThickness,
                right: matThickness,
                bottom: matThickness,
                left: matThickness,
              }}
            />
            <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" />
          </div>
        )}

        {/* Image */}
        <div
          className="absolute z-30 overflow-hidden"
          style={{
            top: frameThickness + matThickness,
            right: frameThickness + matThickness,
            bottom: frameThickness + matThickness,
            left: frameThickness + matThickness,
          }}
        >
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-full object-contain"
            priority
          />
          <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] pointer-events-none" />
        </div>
      </div>
    </div>
  )
}

