import React, { useState } from 'react'
import { BlogEditor } from '~/components/blog/editor'

export const revalidate = 0 // disable cache for admin pages

export default function NewBlogPost() {
  const [content, setContent] = useState('')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">New Blog Post</h1>
      <BlogEditor 
        content={content}
        onChange={setContent}
      />
    </div>
  )
}
