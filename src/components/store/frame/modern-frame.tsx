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
    classic: 'border-[#2d2d2d] rounded-sm',
    modern: 'border-white rounded-sm shadow-lg',
    floating: 'shadow-xl border-transparent',
  }

  const matStyles = {
    white: 'bg-white',
    ivory: 'bg-[#FFFFF0]',
    black: 'bg-black',
    none: '',
  }

  const borderWidths = {
    narrow: 'border-[15px] md:border-[20px]',
    medium: 'border-[20px] md:border-[30px]',
    wide: 'border-[25px] md:border-[40px]',
  }

  return (
    <div className={cn("relative inline-block", frameStyles[frameStyle], borderWidths[frameWidth], className)}>
      <div className={cn("relative", matColor !== "none" && matStyles[matColor], matColor !== "none" && "p-4 md:p-8")}>
        <Image
          src={src || '/placeholder.svg'}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </div>
    </div>
  )
}

