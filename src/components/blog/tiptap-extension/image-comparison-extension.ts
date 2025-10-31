import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageComparisonComponent } from '~/components/blog/image-comparison-node/image-comparison-node'

export interface ImageComparisonOptions {
  HTMLAttributes: Record<string, unknown>
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

  renderHTML({ HTMLAttributes, node }) {
    const {
      beforeImage,
      afterImage,
      orientation = 'horizontal',
      displayMode = 'interactive',
      showLabels = false,
    } = node.attrs

    // If no images are provided, show placeholder
    if (!beforeImage || !afterImage) {
      return [
        'div',
        mergeAttributes(
          {
            'data-type': 'image-comparison',
            class:
              'my-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500',
          },
          this.options.HTMLAttributes,
          HTMLAttributes,
        ),
        [
          'div',
          {},
          ['p', {}, 'Image comparison placeholder'],
          ['p', { class: 'text-sm' }, 'Configure images to see comparison'],
        ],
      ]
    }

    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'image-comparison',
          'data-before-image': JSON.stringify(beforeImage),
          'data-after-image': JSON.stringify(afterImage),
          'data-orientation': orientation,
          'data-display-mode': displayMode,
          'data-show-labels': showLabels ? 'true' : 'false',
          class: 'mx-auto my-6 w-full max-w-4xl',
        },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      displayMode === 'side-by-side'
        ? [
            // Side-by-Side Mode
            'div',
            { class: 'grid grid-cols-1 gap-4 md:grid-cols-2' },
            [
              'div',
              { class: 'relative' },
              [
                'img',
                {
                  src: beforeImage.src,
                  alt: beforeImage.alt || 'Before image',
                  class: 'h-auto w-full rounded-lg object-cover',
                  style: 'aspect-ratio: 16/9;',
                  draggable: 'false',
                },
              ],
              ...(showLabels
                ? [
                    [
                      'div',
                      {
                        class:
                          'absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-sm text-white',
                      },
                      'Before',
                    ],
                  ]
                : []),
              ...(beforeImage.caption
                ? [
                    [
                      'div',
                      { class: 'mt-1 text-sm text-gray-600' },
                      beforeImage.caption,
                    ],
                  ]
                : []),
            ],
            [
              'div',
              { class: 'relative' },
              [
                'img',
                {
                  src: afterImage.src,
                  alt: afterImage.alt || 'After image',
                  class: 'h-auto w-full rounded-lg object-cover',
                  style: 'aspect-ratio: 16/9;',
                  draggable: 'false',
                },
              ],
              ...(showLabels
                ? [
                    [
                      'div',
                      {
                        class:
                          'absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-sm text-white',
                      },
                      'After',
                    ],
                  ]
                : []),
              ...(afterImage.caption
                ? [
                    [
                      'div',
                      { class: 'mt-1 text-sm text-gray-600' },
                      afterImage.caption,
                    ],
                  ]
                : []),
            ],
          ]
        : [
            // Interactive Slider Mode
            'div',
            {
              class: `comparison-container relative cursor-col-resize select-none overflow-hidden rounded-lg ${orientation === 'vertical' ? 'cursor-row-resize' : ''}`,
              style: 'aspect-ratio: 16/9;',
              'data-slider-position': '50',
            },
            [
              // Before Image (Background)
              'div',
              { class: 'absolute inset-0' },
              [
                'img',
                {
                  src: beforeImage.src,
                  alt: beforeImage.alt || 'Before image',
                  class: 'h-full w-full object-cover',
                  draggable: 'false',
                },
              ],
              ...(beforeImage.caption
                ? [
                    [
                      'div',
                      {
                        class:
                          'absolute bottom-8 left-2 rounded bg-black/70 px-2 py-1 text-sm text-white',
                      },
                      `Before: ${beforeImage.caption}`,
                    ],
                  ]
                : []),
            ],
            [
              // After Image (Clipped)
              'div',
              {
                class:
                  'comparison-after-image absolute inset-0 overflow-hidden',
                style:
                  orientation === 'horizontal'
                    ? 'clip-path: inset(0 50% 0 0);'
                    : 'clip-path: inset(0 0 50% 0);',
              },
              [
                'img',
                {
                  src: afterImage.src,
                  alt: afterImage.alt || 'After image',
                  class: 'h-full w-full object-cover',
                  draggable: 'false',
                },
              ],
              ...(afterImage.caption
                ? [
                    [
                      'div',
                      {
                        class:
                          'absolute bottom-8 right-2 rounded bg-black/70 px-2 py-1 text-sm text-white',
                      },
                      `After: ${afterImage.caption}`,
                    ],
                  ]
                : []),
            ],
            [
              // Slider Line
              'div',
              {
                class: `comparison-slider-line absolute bg-white shadow-lg ${
                  orientation === 'horizontal'
                    ? 'bottom-0 top-0 w-0.5 cursor-col-resize'
                    : 'left-0 right-0 h-0.5 cursor-row-resize'
                }`,
                style:
                  orientation === 'horizontal'
                    ? 'left: 50%; transform: translateX(-50%);'
                    : 'top: 50%; transform: translateY(-50%);',
              },
            ],
            [
              // Slider Handle
              'div',
              {
                class: `comparison-slider-handle absolute border-2 border-gray-300 bg-white shadow-lg transition-transform hover:scale-110 ${
                  orientation === 'horizontal'
                    ? 'top-1/2 h-8 w-8 -translate-y-1/2 cursor-col-resize rounded-full'
                    : 'left-1/2 h-8 w-8 -translate-x-1/2 cursor-row-resize rounded-full'
                }`,
                style:
                  orientation === 'horizontal'
                    ? 'left: 50%; transform: translateX(-50%) translateY(-50%);'
                    : 'top: 50%; transform: translateY(-50%) translateX(-50%);',
              },
              ['div', { class: 'absolute inset-2 rounded-full bg-gray-400' }],
            ],
            ...(showLabels
              ? [
                  [
                    'div',
                    {
                      class:
                        'absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white',
                    },
                    'Before',
                  ],
                  [
                    'div',
                    {
                      class:
                        'absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white',
                    },
                    'After',
                  ],
                ]
              : []),
          ],
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
