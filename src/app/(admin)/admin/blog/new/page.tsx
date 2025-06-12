import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { BlogForm } from '~/components/blog/blog-form'
import { getSession } from '~/lib/auth/auth'
import { Button } from '~/components/ui/button'
import { ChevronLeft } from 'lucide-react'

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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <a href="/admin/blog" className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </a>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            New Blog Post
          </h1>
        </div>
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
      </div>
    </main>
  )
}
