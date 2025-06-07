import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageMasonryComponent } from '../image-masonry-node/image-masonry-node'

export interface ImageMasonryOptions {
  HTMLAttributes: Record<string, any>
}

export interface MasonryImage {
  src: string
  alt?: string
  caption?: string
  id: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageMasonry: {
      setImageMasonry: (options: {
        images: MasonryImage[]
        columns?: number
        gap?: 'small' | 'medium' | 'large'
        captionsEnabled?: boolean
      }) => ReturnType
    }
  }
}

export const ImageMasonryExtension = Node.create<ImageMasonryOptions>({
  name: 'imageMasonry',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: (element) => {
          const data = element.getAttribute('data-images')
          return data ? JSON.parse(data) : []
        },
        renderHTML: (attributes) => {
          if (!attributes.images) return {}
          return {
            'data-images': JSON.stringify(attributes.images),
          }
        },
      },
      columns: {
        default: 3,
        parseHTML: (element) => {
          const cols = element.getAttribute('data-columns')
          return cols ? parseInt(cols, 10) : 3
        },
        renderHTML: (attributes) => {
          return {
            'data-columns': attributes.columns?.toString() || '3',
          }
        },
      },
      gap: {
        default: 'medium',
        parseHTML: (element) => element.getAttribute('data-gap') || 'medium',
        renderHTML: (attributes) => {
          return {
            'data-gap': attributes.gap || 'medium',
          }
        },
      },
      captionsEnabled: {
        default: true,
        parseHTML: (element) => {
          const captions = element.getAttribute('data-captions-enabled')
          return captions ? captions === 'true' : true
        },
        renderHTML: (attributes) => {
          return {
            'data-captions-enabled':
              attributes.captionsEnabled?.toString() || 'true',
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-masonry"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const {
      images = [],
      columns = 3,
      gap = 'medium',
      captionsEnabled = true,
    } = node.attrs

    // If no images, return placeholder
    if (!images || images.length === 0) {
      return [
        'div',
        mergeAttributes(
          {
            'data-type': 'image-masonry',
            'data-images': JSON.stringify([]),
            'data-columns': columns.toString(),
            'data-gap': gap,
            'data-captions-enabled': captionsEnabled ? 'true' : 'false',
            class: 'my-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500',
          },
          this.options.HTMLAttributes,
          HTMLAttributes,
        ),
        [
          'div',
          {},
          ['p', {}, 'Image masonry placeholder'],
          ['p', { class: 'text-sm' }, 'Add images to create a masonry layout'],
        ],
      ]
    }

    // Gap classes
    const gapClasses = {
      small: captionsEnabled ? 'gap-2' : 'gap-px',
      medium: captionsEnabled ? 'gap-4' : 'gap-1',
      large: captionsEnabled ? 'gap-6' : 'gap-2',
    }

    const itemSpacing = {
      small: captionsEnabled ? 'mb-2' : 'mb-px',
      medium: captionsEnabled ? 'mb-4' : 'mb-0.5',
      large: captionsEnabled ? 'mb-6' : 'mb-1',
    }

    const columnClasses = {
      2: 'sm:columns-1 md:columns-2',
      3: 'sm:columns-1 md:columns-2 lg:columns-3',
      4: 'sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4',
      5: 'sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5',
    }

    // Generate HTML structure that matches the React component
    const containerClass = 'mx-auto my-6 w-full max-w-6xl'
    const masonryClass = `mx-auto max-w-5xl ${columnClasses[columns as keyof typeof columnClasses] || 'sm:columns-1 md:columns-2 lg:columns-3'} ${gapClasses[gap as keyof typeof gapClasses]}`

    // Create image elements
    const imageElements = images.map((image: any, index: number) => {
      const itemClass = `masonry-item break-inside-avoid overflow-hidden rounded-md transition-transform duration-100 hover:scale-[0.97] ${itemSpacing[gap as keyof typeof itemSpacing]}`

      const imgElement = [
        'img',
        {
          src: image.src,
          alt: image.alt || `Masonry image ${index + 1}`,
          class: 'w-full object-cover my-0 cursor-pointer',
          style: 'margin-top: 0; margin-bottom: 0;',
          loading: 'lazy',
          'data-image-id': image.id,
          'data-image-index': index.toString(),
        },
      ]

      if (captionsEnabled && image.caption) {
        return [
          'div',
          { 
            class: itemClass,
            'data-image-id': image.id,
            'data-image-index': index.toString(),
          },
          ['div', { class: 'relative' }, imgElement],
          [
            'div',
            { class: 'mt-2 px-1 text-sm text-gray-600' },
            image.caption,
          ],
        ]
      } else {
        return [
          'div',
          { 
            class: itemClass,
            'data-image-id': image.id,
            'data-image-index': index.toString(),
          },
          ['div', { class: 'relative' }, imgElement],
        ]
      }
    })

    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'image-masonry',
          'data-images': JSON.stringify(images),
          'data-columns': columns.toString(),
          'data-gap': gap,
          'data-captions-enabled': captionsEnabled ? 'true' : 'false',
          class: containerClass,
        },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      ['div', { class: masonryClass }, ...imageElements],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageMasonryComponent)
  },

  addCommands() {
    return {
      setImageMasonry:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})

export default ImageMasonryExtension
