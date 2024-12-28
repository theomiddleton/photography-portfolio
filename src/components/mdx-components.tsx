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
import { ImageLayoutPreview } from '~/components/image-layout'
import Image from 'next/image'

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
  ImageGallery: ({ images }: { images: string[] }) => {
    if (!Array.isArray(images)) {
      console.warn('ImageGallery: images prop must be an array')
      return null
    }

    return (
      <div className="w-full overflow-hidden">
        <div className="sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {images.map((image, i) => (
            <div key={i} className="mb-4 break-inside-avoid">
              <Image
                src={image}
                alt={''}
                className="w-full h-auto rounded-md"
                width={400}
                height={600}
              />
            </div>
          ))}
        </div>
      </div>
    )
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
}
