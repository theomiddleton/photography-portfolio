'use client'

import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote } from 'next-mdx-remote'
import { components } from '~/components/pages/mdx-components/mdx-components'
import { useEffect, useState } from 'react'

interface MDXPreviewProps {
  content: string
}

export function MDXPreview({ content }: MDXPreviewProps) {
  const [compiledContent, setCompiledContent] = useState<any>(null)

  useEffect(() => {
    const compileMdx = async () => {
      try {
        const mdxSource = await serialize(content, {
          parseFrontmatter: false,
        })
        setCompiledContent(mdxSource)
      } catch (error) {
        console.error('MDX compilation failed:', error)
      }
    }

    if (content) {
      compileMdx()
    }
  }, [content])

  return (
    <div className="border rounded-lg p-4 prose prose-sm max-w-none h-[calc(100vh-400px)] overflow-auto">
      {compiledContent && (
        <MDXRemote {...compiledContent} components={components} />
      )}
    </div>
  )
}