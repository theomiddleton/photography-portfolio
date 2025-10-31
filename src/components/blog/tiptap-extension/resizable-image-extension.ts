import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ResizableImageComponent } from '~/components/blog/resizable-image-node/resizable-image-node'

export interface ResizableImageOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      /**
       * Add a resizable image
       */
      setResizableImage: (options: {
        src: string
        alt?: string
        title?: string
        width?: number
        height?: number
      }) => ReturnType

      /**
       * Convert existing regular images to resizable images
       */
      convertImagesToResizable: () => ReturnType
    }
  }
}

export const ResizableImageExtension = Node.create<ResizableImageOptions>({
  name: 'resizableImage',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.src) return {}
          return { src: attributes.src }
        },
        parseHTML: (element) => element.getAttribute('src'),
      },
      alt: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.alt) return {}
          return { alt: attributes.alt }
        },
        parseHTML: (element) => element.getAttribute('alt'),
      },
      title: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.title) return {}
          return { title: attributes.title }
        },
        parseHTML: (element) => element.getAttribute('title'),
      },
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return {
            width: attributes.width.toString(),
            style: `width: ${attributes.width}px;`,
          }
        },
        parseHTML: (element) => {
          const width = element.getAttribute('width')
          return width ? parseInt(width, 10) : null
        },
      },
      height: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.height) return {}
          return {
            height: attributes.height.toString(),
            style: `${attributes.width ? `width: ${attributes.width}px; ` : ''}height: ${attributes.height}px;`,
          }
        },
        parseHTML: (element) => {
          const height = element.getAttribute('height')
          return height ? parseInt(height, 10) : null
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[data-type="resizable-image"]',
      },
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          // Capture all images that don't belong to other special extensions
          if (typeof element === 'string') return false
          const dataType = element.getAttribute('data-type')

          // Skip images that belong to other extensions
          if (
            dataType &&
            ['image-gallery', 'image-masonry', 'image-comparison'].includes(
              dataType,
            )
          ) {
            return false
          }

          // Accept regular images and resizable images
          return {}
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const { src, alt, title, width, height } = node.attrs

    const attributes: Record<string, unknown> = {
      'data-type': 'resizable-image',
      src,
    }

    if (alt) attributes.alt = alt
    if (title) attributes.title = title
    if (width) {
      attributes.width = width.toString()
      attributes.style = `width: ${width}px;`
    }
    if (height) {
      attributes.height = height.toString()
      if (attributes.style) {
        attributes.style += ` height: ${height}px;`
      } else {
        attributes.style = `height: ${height}px;`
      }
    }

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, attributes),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },

  addCommands() {
    return {
      setResizableImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },

      convertImagesToResizable:
        () =>
        ({ tr, state }) => {
          const { doc } = state
          let hasChanges = false

          doc.descendants((node, pos) => {
            if (node.type.name === 'image') {
              const resizableImageNode =
                state.schema.nodes.resizableImage.create({
                  src: node.attrs.src,
                  alt: node.attrs.alt,
                  title: node.attrs.title,
                  width: node.attrs.width
                    ? parseInt(node.attrs.width, 10)
                    : undefined,
                  height: node.attrs.height
                    ? parseInt(node.attrs.height, 10)
                    : undefined,
                })

              tr.replaceWith(pos, pos + node.nodeSize, resizableImageNode)
              hasChanges = true
            }
          })

          return hasChanges
        },
    }
  },
})

export default ResizableImageExtension
