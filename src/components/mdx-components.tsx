import { Button } from '~/components/ui/button'
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
}