"use client"

import * as React from "react"

type SpacerOrientation = "horizontal" | "vertical"

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: SpacerOrientation
  size?: string | number
}

export const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ orientation = "horizontal", size = "1rem", className, ...props }, ref) => {
    const style = React.useMemo(() => {
      const sizeValue = typeof size === "number" ? `${size}px` : size
      return {
        [orientation === "horizontal" ? "width" : "height"]: sizeValue,
      }
    }, [orientation, size])

    return (
      <div
        ref={ref}
        className={`
          flex-shrink-0
          ${orientation === "horizontal" ? "w-full" : "h-full"}
          ${className || ""}
        `.trim()}
        style={style}
        {...props}
      />
    )
  }
)

Spacer.displayName = "Spacer"
