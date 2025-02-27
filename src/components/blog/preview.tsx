'use client'

import { type FC } from 'react'
import { MDXRemote } from 'next-mdx-remote'
import { Card, CardContent } from '~/components/ui/card'
import { cn } from '~/lib/utils'

interface BlogPreviewProps {
  content: string
  className?: string
}

export const BlogPreview: FC<BlogPreviewProps> = ({ content, className }) => {
  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="prose prose-stone max-w-none p-4 dark:prose-invert">
        <MDXRemote source={content} />
      </CardContent>
    </Card>
  )
}
