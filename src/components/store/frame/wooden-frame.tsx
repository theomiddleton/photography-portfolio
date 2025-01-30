import Image from 'next/image'
import { cn } from '~/lib/utils'

interface WoodenFrameProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  woodType: 'walnut' | 'oak' | 'mahogany' | 'pine'
  matColor: 'white' | 'ivory' | 'black' | 'none'
  frameWidth: 'narrow' | 'medium' | 'wide'
}

export function WoodenFrame({
  src,
  alt,
  width,
  height,
  className,
  woodType = 'walnut',
  matColor = 'ivory',
  frameWidth = 'medium',
}: WoodenFrameProps) {
  const frameWidths = {
    narrow: 20,
    medium: 30,
    wide: 40,
  }

  const woodPatterns = {
    walnut: {
      background: "bg-[#3E2723]",
      texture: `
        bg-[linear-gradient(30deg,rgba(0,0,0,.15)_0%,transparent_20%,transparent_40%,rgba(0,0,0,.15)_50%)]
        before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(62,39,35,0.5)_0%,transparent_50%)]
        after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(0,0,0,.1)_0%,transparent_20%,transparent_80%,rgba(0,0,0,.1)_100%)]
        [background-size:100px_100px]
      `,
      border: "border-[#2D1810]",
    },
    oak: {
      background: "bg-[#C4A484]",
      texture: `
        bg-[linear-gradient(30deg,rgba(0,0,0,.1)_0%,transparent_20%,transparent_40%,rgba(0,0,0,.1)_50%)]
        before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(196,164,132,0.5)_0%,transparent_50%)]
        after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(0,0,0,.05)_0%,transparent_20%,transparent_80%,rgba(0,0,0,.05)_100%)]
        [background-size:80px_80px]
      `,
      border: "border-[#8B7355]",
    },
    mahogany: {
      background: "bg-[#4A0404]",
      texture: `
        bg-[linear-gradient(30deg,rgba(0,0,0,.2)_0%,transparent_20%,transparent_40%,rgba(0,0,0,.2)_50%)]
        before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(74,4,4,0.5)_0%,transparent_50%)]
        after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(0,0,0,.15)_0%,transparent_20%,transparent_80%,rgba(0,0,0,.15)_100%)]
        [background-size:120px_120px]
      `,
      border: "border-[#2B0000]",
    },
    pine: {
      background: "bg-[#DEB887]",
      texture: `
        bg-[linear-gradient(30deg,rgba(0,0,0,.05)_0%,transparent_20%,transparent_40%,rgba(0,0,0,.05)_50%)]
        before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(222,184,135,0.5)_0%,transparent_50%)]
        after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(0,0,0,.03)_0%,transparent_20%,transparent_80%,rgba(0,0,0,.03)_100%)]
        [background-size:60px_60px]
      `,
      border: "border-[#BC8F5E]",
    },
  }

  const matStyles = {
    white: "bg-[linear-gradient(110deg,#fff_0%,#f5f5f5_100%)]",
    ivory: "bg-[linear-gradient(110deg,#FFFFF0_0%,#FFF8DC_100%)]",
    black: "bg-[linear-gradient(110deg,#222_0%,#111_100%)]",
    none: "",
  }

  const matTextures = {
    white:
      "after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGNUY1RjUiPjwvcmVjdD4KPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI0Y1RjVGNSI+PC9yZWN0Pgo8L3N2Zz4=')] after:opacity-50 after:pointer-events-none",
    ivory:
      "after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjRkZGRkYwIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGRkY4REMiPjwvcmVjdD4KPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI0ZGRjhEQyI+PC9yZWN0Pgo8L3N2Zz4=')] after:opacity-50 after:pointer-events-none",
    black:
      "after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjIyMjIyIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxMTExMTEiPjwvcmVjdD4KPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzExMTExMSI+PC9yZWN0Pgo8L3N2Zz4=')] after:opacity-30 after:pointer-events-none",
    none: "",
  }

  const borderWidth = frameWidths[frameWidth]

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Outer frame shadow */}
      <div className="absolute inset-0 blur-[2px] bg-black/20 translate-y-1" />

      {/* Main frame */}
      <div
        className={cn(
          "relative overflow-hidden",
          woodPatterns[woodType].background,
          woodPatterns[woodType].texture,
          woodPatterns[woodType].border,
          "before:pointer-events-none after:pointer-events-none",
          "border-[2px]",
        )}
        style={{
          padding: borderWidth,
        }}
      >
        {/* Inner frame shadow */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" />

        {/* Frame corners */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-8 h-8 bg-[linear-gradient(45deg,rgba(0,0,0,0.2),transparent)]" />
          <div className="absolute top-0 right-0 w-8 h-8 bg-[linear-gradient(-45deg,rgba(0,0,0,0.2),transparent)]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 bg-[linear-gradient(135deg,rgba(0,0,0,0.2),transparent)]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-[linear-gradient(-135deg,rgba(0,0,0,0.2),transparent)]" />
        </div>

        {/* Mat and Image container */}
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
            {/* Glass reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none z-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

