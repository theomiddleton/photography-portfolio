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

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'image-masonry',
        },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
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
