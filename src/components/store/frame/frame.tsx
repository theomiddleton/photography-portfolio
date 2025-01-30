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
    narrow: 0.04,  // 4% of respective dimension
    medium: 0.06,  // 6% of respective dimension
    wide: 0.08,    // 8% of respective dimension
  }

  const matWidths = {
    narrow: 0.03,  // 3% of respective dimension
    medium: 0.045, // 4.5% of respective dimension
    wide: 0.06,    // 6% of respective dimension
  }

  const isWooden = ['walnut', 'oak', 'mahogany', 'pine'].includes(frameStyle)
  const isFloating = frameStyle === 'floating'
  
  // Calculate frame and mat thickness based on respective dimensions
  const frameThicknessHorizontal = Math.round(width * frameWidths[frameWidth])
  const frameThicknessVertical = Math.round(height * frameWidths[frameWidth])
  const matThicknessHorizontal = matColor !== 'none' ? Math.round(width * matWidths[frameWidth]) : 0
  const matThicknessVertical = matColor !== 'none' ? Math.round(height * matWidths[frameWidth]) : 0

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
              top: frameThicknessVertical,
              right: frameThicknessHorizontal,
              bottom: frameThicknessVertical,
              left: frameThicknessHorizontal,
            }}
          />
        </div>

        {/* Mat - constructed with borders */}
        {matColor !== "none" && (
          <div
            className={cn("absolute z-20", matStyles[matColor], "shadow-[0_2px_8px_rgba(0,0,0,0.15)]")}
            style={{
              top: frameThicknessVertical,
              right: frameThicknessHorizontal,
              bottom: frameThicknessVertical,
              left: frameThicknessHorizontal,
            }}
          >
            {/* Mat opening */}
            <div
              className="absolute bg-white"
              style={{
                top: matThicknessVertical,
                right: matThicknessHorizontal,
                bottom: matThicknessVertical,
                left: matThicknessHorizontal,
              }}
            />
            <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" />
          </div>
        )}

        {/* Image */}
        <div
          className="absolute z-30 overflow-hidden"
          style={{
            top: frameThicknessVertical + matThicknessVertical,
            right: frameThicknessHorizontal + matThicknessHorizontal,
            bottom: frameThicknessVertical + matThicknessVertical,
            left: frameThicknessHorizontal + matThicknessHorizontal,
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

