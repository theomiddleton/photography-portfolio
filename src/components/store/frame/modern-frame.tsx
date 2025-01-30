import Image from 'next/image'
import { cn } from '~/lib/utils'

interface ModernFrameProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  frameStyle: 'classic' | 'modern' | 'floating'
  matColor: 'white' | 'ivory' | 'black' | 'none'
  frameWidth: 'narrow' | 'medium' | 'wide'
}

export function ModernFrame({
  src,
  alt,
  width,
  height,
  className,
  frameStyle = 'classic',
  matColor = 'white',
  frameWidth = 'medium',
}: ModernFrameProps) {
  const frameStyles = {
    classic: 'border-[#2d2d2d] rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]',
    modern: 'border-white rounded-sm shadow-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]',
    floating: 'shadow-xl border-transparent',
  }

  const matStyles = {
    white: 'bg-[linear-gradient(110deg,#fff_0%,#f5f5f5_100%)]',
    ivory: 'bg-[linear-gradient(110deg,#FFFFF0_0%,#FFF8DC_100%)]',
    black: 'bg-[linear-gradient(110deg,#222_0%,#111_100%)]',
    none: '',
  }

  const matTextures = {
    white:
      "after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGNUY1RjUiPjwvcmVjdD4KPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI0Y1RjVGNSI+PC9yZWN0Pgo8L3N2Zz4=')] after:opacity-50 after:pointer-events-none",
    ivory:
      "after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjRkZGRkYwIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGRkY4REMiPjwvcmVjdD4KPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI0ZGRjhEQyI+PC9yZWN0Pgo8L3N2Zz4=')] after:opacity-50 after:pointer-events-none",
    black:
      "after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjIyMjIyIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxMTExMTEiPjwvcmVjdD4KPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzExMTExMSI+PC9yZWN0Pgo8L3N2Zz4=')] after:opacity-30 after:pointer-events-none",
    none: '',
  }

  const borderWidths = {
    narrow: 'border-[15px] md:border-[20px]',
    medium: 'border-[20px] md:border-[30px]',
    wide: 'border-[25px] md:border-[40px]',
  }

  return (
    <div className={cn("relative inline-block", frameStyles[frameStyle], borderWidths[frameWidth], className)}>
      {/* Frame shadow */}
      <div className="absolute inset-0 blur-[2px] bg-black/20 translate-y-1" />

      {/* Frame */}
      <div className="relative">
        {/* Mat */}
        <div
          className={cn(
            "relative",
            matColor !== "none" && [
              matStyles[matColor],
              matTextures[matColor],
              "p-4 md:p-8",
              // Mat shadow
              "shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]",
            ],
          )}
        >
          {/* Image container with shadow */}
          <div className="relative shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <Image
              src={src || "/placeholder.svg"}
              alt={alt}
              width={width}
              height={height}
              className="w-full h-auto relative z-10"
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
            {/* Subtle glass reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none z-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

