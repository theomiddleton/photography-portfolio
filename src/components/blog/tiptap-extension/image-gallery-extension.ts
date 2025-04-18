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

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'image-gallery',
      }),
      0, // Represents the content hole, gallery is atomic so no content
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
