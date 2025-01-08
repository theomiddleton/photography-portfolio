import Image from 'next/image'
import { cn } from '~/lib/utils'

interface ImageCompareProps {
  leftImage: string
  rightImage: string
  leftAlt?: string
  rightAlt?: string
  className?: string
  height?: number
  gap?: number
  leftCaption?: string
  rightCaption?: string
}

export function ImageCompare({
  leftImage,
  rightImage,
  leftAlt = 'Left image',
  rightAlt = 'Right image',
  className,
  height = 400,
  gap = 16,
  leftCaption,
  rightCaption
}: ImageCompareProps) {
  return (
    <figure className={cn("my-8 w-full", className)}>
      <div 
        className="grid grid-cols-2 gap-4" 
        style={{ gap }}
      >
        <div className="relative w-full" style={{ height }}>
          <Image
            src={leftImage}
            alt={leftAlt}
            fill
            className="rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {leftCaption && (
            <figcaption className="mt-2 text-sm text-muted-foreground">
              {leftCaption}
            </figcaption>
          )}
        </div>
        <div className="relative w-full" style={{ height }}>
          <Image
            src={rightImage}
            alt={rightAlt}
            fill
            className="rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {rightCaption && (
            <figcaption className="mt-2 text-sm text-muted-foreground">
              {rightCaption}
            </figcaption>
          )}
        </div>
      </div>
    </figure>
  )
}
