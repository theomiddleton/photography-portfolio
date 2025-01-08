import Image from 'next/image'
import { cn } from '~/lib/utils'

interface ImageCompareProps {
  leftImage: string
  rightImage: string
  leftAlt?: string
  rightAlt?: string
  className?: string
  /**
   * If height isnt passed aspect ratio will be preserved
   */
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
  height,
  gap = 16,
  leftCaption,
  rightCaption
}: ImageCompareProps) {
  return (
    <div className={cn("my-8 not-prose mx-auto max-w-4xl", className)}>
      <div 
        className="grid grid-cols-1 md:grid-cols-2 mx-auto w-full" 
        style={{ gap }}
      >
        <figure className="flex flex-col items-center">
          <div 
            className="relative w-full overflow-hidden rounded-lg" 
            style={height ? { height } : { paddingBottom: '66.66%' }}
          >
            <Image
              src={leftImage}
              alt={leftAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {leftCaption && (
            <figcaption className="mt-2 text-sm text-center text-muted-foreground">
              {leftCaption}
            </figcaption>
          )}
        </figure>
        <figure className="flex flex-col items-center">
          <div 
            className="relative w-full overflow-hidden rounded-lg" 
            style={height ? { height } : { paddingBottom: '66.66%' }}
          >
            <Image
              src={rightImage}
              alt={rightAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {rightCaption && (
            <figcaption className="mt-2 text-sm text-center text-muted-foreground">
              {rightCaption}
            </figcaption>
          )}
        </figure>
      </div>
    </div>
  )
}

