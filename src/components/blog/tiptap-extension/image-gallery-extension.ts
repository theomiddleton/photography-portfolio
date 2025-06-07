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

    // Create thumbnails for the bottom navigation - duplicate for infinite scroll
    const duplicatedSources = [...sources, ...sources, ...sources] // Triple for smooth wrapping
    const thumbnailElements = duplicatedSources.map((src: string, index: number) => [
      'button',
      {
        class: `gallery-thumbnail relative block aspect-[4/3] w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300`,
        'data-index': (index % sources.length).toString(),
        'data-original-index': (index % sources.length).toString(),
        'aria-label': `View gallery image ${(index % sources.length) + 1}`,
      },
      [
        'img',
        {
          src,
          alt: `Gallery image ${(index % sources.length) + 1}`,
          class: 'h-full w-full object-cover',
          loading: 'lazy',
        },
      ],
    ])

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'image-gallery',
        'data-sources': JSON.stringify(sources),
        class: 'image-gallery-container w-full max-w-5xl mx-auto px-4 py-8',
      }),
      [
        // Main image container
        'div',
        { class: 'gallery-main-container relative aspect-[16/9] w-full overflow-hidden rounded-lg mb-4' },
        [
          'img',
          {
            src: sources[0],
            alt: 'Gallery image 1',
            class: 'gallery-main-image w-full h-full object-contain',
            'data-current-index': '0',
          },
        ],
        // Navigation arrows
        [
          'div',
          { class: 'absolute inset-0 flex items-center justify-between p-4 pointer-events-none' },
          [
            'button',
            {
              class: 'gallery-prev h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 shadow-lg flex items-center justify-center pointer-events-auto transition-all duration-200 hover:scale-110',
              'aria-label': 'Previous image',
            },
            ['span', { class: 'text-xl font-bold text-gray-700 dark:text-gray-300' }, '‹'],
          ],
          [
            'button',
            {
              class: 'gallery-next h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 shadow-lg flex items-center justify-center pointer-events-auto transition-all duration-200 hover:scale-110',
              'aria-label': 'Next image',
            },
            ['span', { class: 'text-xl font-bold text-gray-700 dark:text-gray-300' }, '›'],
          ],
        ],
      ],
      [
        // Thumbnails container with centered selector
        'div',
        { class: 'gallery-thumbnails relative py-6' },
        [
          // Fixed center selector (black outline)
          'div',
          { class: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 aspect-[4/3] rounded-lg border-2 border-black dark:border-white z-10 pointer-events-none' },
        ],
        [
          'div',
          { class: 'thumbnail-viewport overflow-hidden mx-auto' },
          [
            'div',
            { 
              class: 'thumbnail-track flex gap-3 transition-transform duration-300 ease-out',
              style: 'transform: translateX(0px)'
            },
            ...thumbnailElements,
          ],
        ],
      ],
      [
        // Image counter
        'div',
        { class: 'gallery-counter mt-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-3 py-1 inline-block mx-auto' },
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
