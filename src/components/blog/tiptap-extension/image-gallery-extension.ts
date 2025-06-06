import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageGalleryNodeView } from '~/components/blog/image-gallery-node/image-gallery-node-view'

export interface ImageGalleryOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageGallery: {
      /**
       * Add an image gallery
       */
      setImageGallery: (options: { sources: string[] }) => ReturnType
    }
  }
}

export const ImageGalleryExtension = Node.create<ImageGalleryOptions>({
  name: 'imageGallery',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      sources: {
        default: [],
        parseHTML: (element) => {
          const sourcesAttr = element.getAttribute('data-sources')
          try {
            return sourcesAttr ? JSON.parse(sourcesAttr) : []
          } catch (e) {
            console.error('Error parsing image gallery sources:', e)
            return []
          }
        },
        renderHTML: (attributes) => {
          return {
            'data-sources': JSON.stringify(attributes.sources),
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-gallery"]',
      },
    ]
  },
  
  // Fix with matching style to dynamic rendering
  renderHTML({ HTMLAttributes, node }) {
    const { sources = [] } = node.attrs

    // If no sources, return empty div
    if (!sources || sources.length === 0) {
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          'data-type': 'image-gallery',
        }),
      ]
    }

    // Create image elements for static rendering
    const imageElements = sources.map((src: string, index: number) => [
      'div',
      { class: 'gallery-item' },
      [
        'img',
        {
          src,
          alt: `Gallery image ${index + 1}`,
          class: 'w-full h-auto object-cover rounded-lg',
          loading: 'lazy',
        },
      ],
    ])

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'image-gallery',
        class: 'image-gallery-container my-6',
      }),
      [
        'div',
        {
          class: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
        },
        ...imageElements,
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageGalleryNodeView)
  },

  addCommands() {
    return {
      setImageGallery:
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
