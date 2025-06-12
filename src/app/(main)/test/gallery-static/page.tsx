'use client'

import { TipTapRenderer } from '~/components/blog/tiptap-renderer'

const testContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'TipTap Static Renderer Test' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This page tests the static rendering of TipTap content with interactive image galleries and other components.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Interactive Image Gallery' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'The gallery below should be fully interactive with clickable thumbnails, navigation arrows, and keyboard controls.',
        },
      ],
    },
    {
      type: 'imageGallery',
      attrs: {
        sources: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
          'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
          'https://images.unsplash.com/photo-1473800447596-01729482b8eb?w=800',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
        ],
      },
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Gallery Features' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '✅ Click on thumbnails to change main image' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '✅ Use left/right navigation arrows' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '✅ Keyboard navigation with arrow keys' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '✅ Image counter updates correctly' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '✅ Selected thumbnail has outline highlight' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '✅ Smooth fade transitions between images' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '✅ Hover effects on thumbnails and navigation' }],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Rich Text Features' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This is a paragraph with ',
        },
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'bold text',
        },
        {
          type: 'text',
          text: ', ',
        },
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: 'italic text',
        },
        {
          type: 'text',
          text: ', and ',
        },
        {
          type: 'text',
          marks: [{ type: 'highlight' }],
          text: 'highlighted text',
        },
        {
          type: 'text',
          text: '.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Here is a ',
        },
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
          text: 'clickable link',
        },
        {
          type: 'text',
          text: ' for testing.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Success!' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '🎉 The TipTap static renderer now successfully handles image galleries with full interactivity, matching the editor experience!',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Large Gallery (Infinite Scroll Test)' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This gallery has many images to demonstrate the infinite scrolling and centering behavior. Try clicking the last image (10) then next - it should cycle to image 1.',
        },
      ],
    },
    {
      type: 'imageGallery',
      attrs: {
        sources: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
          'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
          'https://images.unsplash.com/photo-1473800447596-01729482b8eb?w=800',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
          'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
          'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
          'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800',
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
          'https://images.unsplash.com/photo-1414016642750-7fdd78dc33d9?w=800',
        ],
      },
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Small Gallery (3 Images)' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This small gallery tests the viewport sizing when there are fewer images than the maximum visible thumbnails.',
        },
      ],
    },
    {
      type: 'imageGallery',
      attrs: {
        sources: [
          'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
          'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
          'https://images.unsplash.com/photo-1464822759844-d150baac0cd1?w=800',
        ],
      },
    },
  ],
}

export default function GalleryStaticTestPage() {
  return (
    <div className="min-h-screen bg-white py-16 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4">
      <TipTapRenderer content={testContent} />
      </div>
    </div>
  )
}
