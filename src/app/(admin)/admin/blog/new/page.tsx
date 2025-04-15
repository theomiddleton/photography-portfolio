import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { BlogForm } from '~/components/blog/blog-form'
import { getSession } from '~/lib/auth/auth'

const initialContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Start writing your blog post...' }],
    },
  ],
}

export default async function NewPostPage() {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">New Blog Post</h1>
      <Suspense
        fallback={
          <div className="w-full animate-pulse space-y-4">
            <div className="h-10 rounded-md bg-gray-100" />
            <div className="h-20 rounded-md bg-gray-100" />
            <div className="h-10 rounded-md bg-gray-100" />
            <div className="h-[600px] rounded-md bg-gray-100" />
          </div>
        }
      >
        <BlogForm initialContent={initialContent} />
      </Suspense>
    </main>
  )
}
