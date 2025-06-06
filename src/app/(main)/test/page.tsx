'use client'

import { TipTapRenderer } from '~/components/blog/tiptap-renderer'

export default function TestStaticComparison() {
  // Test content with image comparison static nodes
  const testContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [
          {
            type: 'text',
            text: 'Image Comparison Test',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Testing side-by-side mode:',
          },
        ],
      },
      {
        type: 'imageComparison',
        attrs: {
          beforeImage:
            'https://img.theomiddleton.me/86e21eda-c7a7-45a6-a5b8-16551649828c.jpg',
          afterImage:
            'https://img.theomiddleton.me/86b23a44-af67-48f0-899f-c34f8210bd5f.jpg',
          beforeLabel: 'Before',
          afterLabel: 'After',
          orientation: 'horizontal',
          displayMode: 'side-by-side',
          showLabels: true,
        },
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Testing interactive slider mode:',
          },
        ],
      },
      {
        type: 'imageComparison',
        attrs: {
          beforeImage: 'https://picsum.photos/800/600?random=3',
          afterImage: 'https://picsum.photos/800/600?random=4',
          beforeLabel: 'Original',
          afterLabel: 'Modified',
          orientation: 'horizontal',
          displayMode: 'interactive',
          showLabels: true,
        },
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Testing vertical orientation:',
          },
        ],
      },
      {
        type: 'imageComparison',
        attrs: {
          beforeImage: 'https://picsum.photos/600/800?random=5',
          afterImage: 'https://picsum.photos/600/800?random=6',
          beforeLabel: 'Top',
          afterLabel: 'Bottom',
          orientation: 'vertical',
          displayMode: 'interactive',
          showLabels: true,
        },
      },
    ],
  }

  return (
    <div className="container mx-auto mt-16 px-4 py-8">
      <TipTapRenderer content={testContent} />
    </div>
  )
}
