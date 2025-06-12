import { Node, mergeAttributes } from '@tiptap/core'

export interface ImageComparisonStaticOptions {
  HTMLAttributes: Record<string, any>
}

export interface ImageData {
  src: string
  alt?: string
  caption?: string
}

export const ImageComparisonStaticExtension =
  Node.create<ImageComparisonStaticOptions>({
    name: 'imageComparisonStatic',

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
          tag: 'div[data-type="image-comparison-static"]',
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
              'data-type': 'image-comparison-static',
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

      const containerClass = 'mx-auto my-6 w-full max-w-4xl'

      if (displayMode === 'side-by-side') {
        // Side-by-Side Mode
        const beforeImageElement = [
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
        ]

        const afterImageElement = [
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
        ]

        return [
          'div',
          mergeAttributes(
            {
              'data-type': 'image-comparison-static',
              class: containerClass,
            },
            this.options.HTMLAttributes,
            HTMLAttributes,
          ),
          [
            'div',
            { class: 'grid grid-cols-1 gap-4 md:grid-cols-2' },
            beforeImageElement,
            afterImageElement,
          ],
        ]
      } else {
        // Interactive Slider Mode - render as static with 50% split for rendering
        const sliderPosition = 50

        const containerClasses = [
          'relative',
          'overflow-hidden',
          'rounded-lg',
          orientation === 'vertical'
            ? 'cursor-row-resize'
            : 'cursor-col-resize',
        ].join(' ')

        // Before Image (Background)
        const beforeImageBg = [
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
        ]

        // After Image (Clipped)
        const clipPath =
          orientation === 'horizontal'
            ? `inset(0 ${100 - sliderPosition}% 0 0)`
            : `inset(0 0 ${100 - sliderPosition}% 0)`

        const afterImageClipped = [
          'div',
          {
            class: 'absolute inset-0 overflow-hidden',
            style: `clip-path: ${clipPath};`,
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
        ]

        // Slider Line
        const sliderLineClasses = [
          'absolute',
          'bg-white',
          'shadow-lg',
          orientation === 'horizontal'
            ? 'bottom-0 top-0 w-0.5 cursor-col-resize'
            : 'left-0 right-0 h-0.5 cursor-row-resize',
        ].join(' ')

        const sliderLineStyle =
          orientation === 'horizontal'
            ? `left: ${sliderPosition}%; transform: translateX(-50%);`
            : `top: ${sliderPosition}%; transform: translateY(-50%);`

        const sliderLine = [
          'div',
          {
            class: sliderLineClasses,
            style: sliderLineStyle,
          },
        ]

        // Slider Handle
        const sliderHandleClasses = [
          'absolute',
          'border-2',
          'border-gray-300',
          'bg-white',
          'shadow-lg',
          'transition-transform',
          'hover:scale-110',
          orientation === 'horizontal'
            ? 'top-1/2 h-8 w-8 -translate-y-1/2 cursor-col-resize rounded-full'
            : 'left-1/2 h-8 w-8 -translate-x-1/2 cursor-row-resize rounded-full',
        ].join(' ')

        const sliderHandleStyle =
          orientation === 'horizontal'
            ? `left: ${sliderPosition}%; transform: translateX(-50%) translateY(-50%);`
            : `top: ${sliderPosition}%; transform: translateY(-50%) translateX(-50%);`

        const sliderHandle = [
          'div',
          {
            class: sliderHandleClasses,
            style: sliderHandleStyle,
          },
          ['div', { class: 'absolute inset-2 rounded-full bg-gray-400' }],
        ]

        // Labels
        const labels = showLabels
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
          : []

        return [
          'div',
          mergeAttributes(
            {
              'data-type': 'image-comparison-static',
              class: containerClass,
            },
            this.options.HTMLAttributes,
            HTMLAttributes,
          ),
          [
            'div',
            {
              class: containerClasses,
              style: 'aspect-ratio: 16/9;',
            },
            beforeImageBg,
            afterImageClipped,
            sliderLine,
            sliderHandle,
            ...labels,
          ],
        ]
      }
    },
  })

export default ImageComparisonStaticExtension
