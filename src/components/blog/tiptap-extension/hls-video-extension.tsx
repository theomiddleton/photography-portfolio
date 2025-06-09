import { Node, mergeAttributes, type Editor } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { HLSPlayer } from '~/components/video/hls-player'

export interface HLSVideoOptions {
  HTMLAttributes: Record<string, any>
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
    const containerClass = 'relative w-full rounded-lg overflow-hidden'

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-hls-video': '',
        'data-src': src,
        'data-poster': poster || '',
        class: containerClass,
      }),
      [
        'video',
        {
          class: 'w-full aspect-video object-cover',
          controls: 'true',
          preload: 'metadata',
          poster: poster || '',
          'data-hls-src': src,
        },
        // Fallback content
        [
          'p',
          { class: 'text-gray-500 text-center p-4' },
          'Your browser does not support HLS video playback.',
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
        ({ chain, commands }) => {
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
