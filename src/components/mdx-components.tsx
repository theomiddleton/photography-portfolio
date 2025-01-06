import { Button } from '~/components/ui/button'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '~/components/ui/card'
import { cn } from '~/lib/utils'
import { HLSPlayer } from '~/components/video/hls-player'
import Image from 'next/image'
import { ImageGallery } from '~/components/image-gallery' 

export const components = {
  Button: (props) => (
    <Button {...props} className="my-2">
      {props.children}
    </Button>
  ),
  InfoBox: ({ title, children }) => (
    <div className="p-4 bg-gray-50 rounded-lg my-2">
      <h4 className="font-bold">{title}</h4>
      {children}
    </div>
  ),
  Image: ({ src, alt, height, width }: { src: string, alt: string, height: number, width: number }) => (
    <div className="rounded-md overflow-hidden">
      <Image
        src={src}
        alt={alt|| 'Image'}
        height={height || 600}
        width={width || 400}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  ),
  HLSPlayer: ({ src, poster, autoplay }: { src: string, poster: string, autoplay: boolean }) => (
    <div className="rounded-md overflow-hidden">
      <HLSPlayer
        src={src}
        poster={poster}
        autoPlay={autoplay}
      />
    </div>
  ),
  ImageGallery: ({ images }: { images: (string | { src: string, alt?: string, width?: number, height?: number })[] }) => {
    if (!Array.isArray(images)) {
      console.warn('ImageGallery: images prop must be an array')
      return null
    }

    const galleryImages = images.map(image => {
      if (typeof image === 'string') {
        return {
          src: image,
          alt: 'Gallery image',
          width: 400,
          height: 600
        }
      }
      return {
        src: image.src,
        alt: image.alt || 'Gallery image',
        width: image.width || 400,
        height: image.height || 600
      }
    })

    return <ImageGallery images={galleryImages} className="my-4" />
  },
  Card: ({ className, children }: React.ComponentProps<typeof Card>) => (
    <Card className={cn('my-4', className)}>
      {children}
    </Card>
  ),
  CardHeader: ({ className, children }: React.ComponentProps<typeof CardHeader>) => (
    <CardHeader className={className}>{children}</CardHeader>
  ),
  CardFooter: ({ className, children }: React.ComponentProps<typeof CardFooter>) => (
    <CardFooter className={className}>{children}</CardFooter>
  ),
  CardTitle: ({ className, children }: React.ComponentProps<typeof CardTitle>) => (
    <CardTitle className={className}>{children}</CardTitle>
  ),
  CardDescription: ({ className, children }: React.ComponentProps<typeof CardDescription>) => (
    <CardDescription className={className}>{children}</CardDescription>
  ),
  CardContent: ({ className, children }: React.ComponentProps<typeof CardContent>) => (
    <CardContent className={className}>{children}</CardContent>
  ),
  CodeBlock: ({ children, language }: { children: React.ReactNode, language: string }) => (
    <div className="relative my-4">
      <div className="absolute top-3 right-3 text-xs text-gray-200">{language}</div>
      <pre className="p-4 bg-slate-800 rounded-lg overflow-x-auto">
        <code className={cn('language-' + language)}>{children}</code>
      </pre>
    </div>
  ),
}
