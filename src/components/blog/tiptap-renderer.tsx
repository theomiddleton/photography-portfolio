'use client'

import { useMemo } from 'react'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { ImageGalleryExtension } from '~/components/blog/tiptap-extension/image-gallery-extension'
import { HLSVideoExtension } from '~/components/blog/tiptap-extension/hls-video-extension'

interface TipTapRendererProps {
  content: any
}

export function TipTapRenderer({ content }: TipTapRendererProps) {
  // Generate HTML from TipTap JSON
  const output = useMemo(() => {
    if (!content) return "<p>No content available</p>"

    try {
      return generateHTML(content, [
        StarterKit,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Underline,
        TaskList.configure({
          HTMLAttributes: {
            class: 'not-prose pl-0',
          },
        }),
        TaskItem.configure({
          nested: true,
          HTMLAttributes: {
            class: 'flex items-start gap-2 my-2 text-base text-gray-900 [&:has(input:checked)]:text-gray-500 [&:has(input:checked)]:line-through',
          },
        }),
        Highlight.configure({ multicolor: true }),
        Image,
        Typography,
        Superscript,
        Subscript,
        Placeholder,
        ImageGalleryExtension,
        HLSVideoExtension,
        Link.configure({ openOnClick: false }),
      ])
    } catch (error) {
      console.error("Error rendering TipTap content:", error)
      return "<p>Error rendering content</p>"
    }
  }, [content])

  // Process the HTML to replace img tags with Next.js Image components
  // This would require a more complex solution
  // For now, we'll use dangerouslySetInnerHTML with some basic styling

  return <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: output }} />
}
