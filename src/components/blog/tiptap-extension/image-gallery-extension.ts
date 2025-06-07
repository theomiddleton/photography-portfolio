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

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'image-gallery',
        'data-sources': JSON.stringify(sources),
        class: 'w-full max-w-5xl mx-auto px-4 py-8',
      }),
      [
        // Main image container
        'div',
        { class: 'relative aspect-[16/9] w-full overflow-hidden rounded-lg' },
        [
          'div',
          { class: 'absolute inset-0 flex items-center justify-center' },
          [
            'img',
            {
              src: sources[0],
              alt: 'Gallery image 1',
              class: 'gallery-main-image w-full h-full object-contain transition-opacity duration-300',
              'data-current-index': '0',
            },
          ],
        ],
        [
          // Navigation arrows
          'div',
          { class: 'absolute inset-0 flex items-center justify-between p-4' },
          [
            'button',
            {
              class: 'gallery-prev h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 border border-gray-200 flex items-center justify-center transition-all duration-200',
              'aria-label': 'Previous image',
            },
            ['span', { class: 'text-lg font-bold text-gray-700' }, '‹'],
          ],
          [
            'button',
            {
              class: 'gallery-next h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 border border-gray-200 flex items-center justify-center transition-all duration-200',
              'aria-label': 'Next image',
            },
            ['span', { class: 'text-lg font-bold text-gray-700' }, '›'],
          ],
        ],
      ],
      [
        // Thumbnails section
        'div',
        { class: 'relative py-4 not-prose' },
        [
          'div',
          { class: 'overflow-hidden' },
          [
            'div',
            { class: 'gallery-thumbnails flex justify-center gap-2' },
            // Thumbnails will be populated by JavaScript
          ],
        ],
      ],
      [
        // Image counter
        'div',
        { class: 'gallery-counter mt-2 text-center text-sm text-gray-600' },
        `1 / ${sources.length}`,
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
