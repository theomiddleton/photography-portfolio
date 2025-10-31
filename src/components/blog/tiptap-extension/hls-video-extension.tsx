import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { HLSPlayer } from '~/components/video/hls-player'

export interface HLSVideoOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hlsVideo: {
      /**
       * Add an HLS video
       */
      setHLSVideo: (options: { src: string; poster?: string }) => ReturnType
    }
  }
}

export const HLSVideoExtension = Node.create<HLSVideoOptions>({
  name: 'hlsVideo',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-src'),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {}
          }
          return { 'data-src': attributes.src }
        },
      },
      poster: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-poster'),
        renderHTML: (attributes) => {
          if (!attributes.poster) {
            return {}
          }
          return { 'data-poster': attributes.poster }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-hls-video]',
        getAttrs: (dom) => {
          const src = (dom as HTMLElement).getAttribute('data-src')
          const poster = (dom as HTMLElement).getAttribute('data-poster')
          return { src, poster: poster || null }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const { src, poster } = node.attrs

    // If no src, return placeholder
    if (!src) {
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          'data-hls-video': '',
          class:
            'border border-dashed border-gray-300 p-4 text-center text-gray-500 rounded-lg my-4',
        }),
        ['p', {}, 'HLS Video: Missing source URL'],
      ]
    }

    // Create complete video HTML structure for static rendering
    const containerClass =
      'relative w-full my-6 rounded-lg overflow-hidden bg-black'

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-hls-video': '',
        'data-src': src,
        'data-poster': poster || '',
        class: containerClass,
      }),
      [
        'div',
        { class: 'relative aspect-video w-full' },
        // Video element for HLS playback
        [
          'video',
          {
            class: 'w-full h-full object-cover',
            controls: 'true',
            preload: 'metadata',
            poster: poster || '',
            'data-hls-src': src,
          },
          // Fallback content
          [
            'p',
            { class: 'text-white text-center p-4' },
            'Your browser does not support HLS video playback.',
          ],
        ],
        // Play button overlay (will be hidden when video loads)
        [
          'div',
          {
            class:
              'absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 play-button-overlay transition-opacity',
            style: poster ? 'display: flex;' : 'display: none;',
          },
          [
            'button',
            {
              class:
                'w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all transform hover:scale-105',
              'aria-label': 'Play video',
            },
            [
              'svg',
              {
                class: 'w-8 h-8 text-black ml-1',
                fill: 'currentColor',
                viewBox: '0 0 20 20',
              },
              [
                'path',
                {
                  'fill-rule': 'evenodd',
                  d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z',
                  'clip-rule': 'evenodd',
                },
              ],
            ],
          ],
        ],
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer((props) => {
      const { src, poster } = props.node.attrs
      const attributes = {
        ...props.HTMLAttributes,
        'data-hls-video': '',
        'data-src': src,
        'data-poster': poster,
      }

      if (!src) {
        return (
          <NodeViewWrapper>
            <div
              {...attributes}
              className="border border-dashed border-gray-300 p-4 text-center text-gray-500"
            >
              HLS Video: Missing source URL
            </div>
          </NodeViewWrapper>
        )
      }

      return (
        <NodeViewWrapper>
          <div {...attributes} contentEditable={false} draggable={true}>
            <div className="relative">
              <HLSPlayer src={src} poster={poster} autoPlay={false} />
            </div>
          </div>
        </NodeViewWrapper>
      )
    })
  },

  addCommands() {
    return {
      setHLSVideo:
        (options) =>
        ({ chain }) => {
          return chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: options,
            })
            .run()
        },
    }
  },
})
