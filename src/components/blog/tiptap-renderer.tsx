'use client'

import { useMemo } from 'react'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlock from '@tiptap/extension-code-block'

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
        Image,
        Link.configure({
          openOnClick: false,
        }),
        Placeholder,
        CodeBlock,
      ])
    } catch (error) {
      console.error("Error rendering TipTap content:", error)
      return "<p>Error rendering content</p>"
    }
  }, [content])

  // Process the HTML to replace img tags with Next.js Image components
  // This would require a more complex solution in a real app
  // For now, we'll use dangerouslySetInnerHTML with some basic styling

  return <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: output }} />
}
