import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageComparisonComponent } from '~/components/blog/image-comparison-node/image-comparison-node'

export interface ImageComparisonOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageComparison: {
      setImageComparison: (options: {
        beforeImage: { src: string; alt?: string; caption?: string }
        afterImage: { src: string; alt?: string; caption?: string }
        orientation?: 'horizontal' | 'vertical'
        displayMode?: 'interactive' | 'side-by-side'
        showLabels?: boolean
      }) => ReturnType
    }
  }
}

export const ImageComparisonExtension = Node.create<ImageComparisonOptions>({
  name: 'imageComparison',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      beforeImage: {
        default: null,
        parseHTML: (element) => {
          const data = element.getAttribute('data-before-image')
          return data ? JSON.parse(data) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.beforeImage) return {}
          return {
            'data-before-image': JSON.stringify(attributes.beforeImage),
          }
        },
      },
      afterImage: {
        default: null,
        parseHTML: (element) => {
          const data = element.getAttribute('data-after-image')
          return data ? JSON.parse(data) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.afterImage) return {}
          return {
            'data-after-image': JSON.stringify(attributes.afterImage),
          }
        },
      },
      orientation: {
        default: 'horizontal',
        parseHTML: (element) =>
          element.getAttribute('data-orientation') || 'horizontal',
        renderHTML: (attributes) => {
          return {
            'data-orientation': attributes.orientation,
          }
        },
      },
      displayMode: {
        default: 'interactive',
        parseHTML: (element) =>
          element.getAttribute('data-display-mode') || 'interactive',
        renderHTML: (attributes) => {
          return {
            'data-display-mode': attributes.displayMode,
          }
        },
      },
      showLabels: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute('data-show-labels') === 'true',
        renderHTML: (attributes) => {
          return {
            'data-show-labels': attributes.showLabels ? 'true' : 'false',
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-comparison"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'image-comparison',
        },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComparisonComponent)
  },

  addCommands() {
    return {
      setImageComparison:
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

export default ImageComparisonExtension
