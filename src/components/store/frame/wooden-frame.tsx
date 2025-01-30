import Image from "next/image"
import { cn } from "~/lib/utils"

interface WoodenFrameProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  woodType: "walnut" | "oak" | "mahogany" | "pine"
  matColor: "white" | "ivory" | "black" | "none"
  frameWidth: "narrow" | "medium" | "wide"
}

export function WoodenFrame({
  src,
  alt,
  width,
  height,
  className,
  woodType = "walnut",
  matColor = "ivory",
  frameWidth = "medium",
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
      `,
      border: "border-[#2D1810]",
    },
    oak: {
      background: "bg-[#C4A484]",
      texture: `
        bg-[linear-gradient(30deg,rgba(0,0,0,.1)_0%,transparent_20%,transparent_40%,rgba(0,0,0,.1)_50%)]
        before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(196,164,132,0.5)_0%,transparent_50%)]
        after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(0,0,0,.05)_0%,transparent_20%,transparent_80%,rgba(0,0,0,.05)_100%)]
      `,
      border: "border-[#8B7355]",
    },
    mahogany: {
      background: "bg-[#4A0404]",
      texture: `
        bg-[linear-gradient(30deg,rgba(0,0,0,.2)_0%,transparent_20%,transparent_40%,rgba(0,0,0,.2)_50%)]
        before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(74,4,4,0.5)_0%,transparent_50%)]
        after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(0,0,0,.15)_0%,transparent_20%,transparent_80%,rgba(0,0,0,.15)_100%)]
      `,
      border: "border-[#2B0000]",
    },
    pine: {
      background: "bg-[#DEB887]",
      texture: `
        bg-[linear-gradient(30deg,rgba(0,0,0,.05)_0%,transparent_20%,transparent_40%,rgba(0,0,0,.05)_50%)]
        before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(222,184,135,0.5)_0%,transparent_50%)]
        after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(0,0,0,.03)_0%,transparent_20%,transparent_80%,rgba(0,0,0,.03)_100%)]
      `,
      border: "border-[#BC8F5E]",
    },
  }

  const matStyles = {
    white: "bg-white",
    ivory: "bg-[#FFFFF0]",
    black: "bg-black",
    none: "",
  }

  const borderWidth = frameWidths[frameWidth]

  return (
    <div className={cn("relative inline-block", className)}>
      <div className="absolute inset-0 blur-sm bg-black/20 translate-y-1" />

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
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]" />

        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-8 h-8 bg-[linear-gradient(45deg,rgba(0,0,0,0.2),transparent)]" />
          <div className="absolute top-0 right-0 w-8 h-8 bg-[linear-gradient(-45deg,rgba(0,0,0,0.2),transparent)]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 bg-[linear-gradient(135deg,rgba(0,0,0,0.2),transparent)]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-[linear-gradient(-135deg,rgba(0,0,0,0.2),transparent)]" />
        </div>

        <div
          className={cn("relative", matColor !== "none" && matStyles[matColor], matColor !== "none" && "p-4 md:p-8")}
        >
          <div className="relative">
            <Image
              src={src || "/placeholder.svg"}
              alt={alt}
              width={width}
              height={height}
              className="w-full h-auto"
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}

