import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { SimpleEditor } from '~/components/blog/editor'
import { getSession } from '~/lib/auth/auth'
import { Card, CardContent } from '~/components/ui/card'
import content from '~/components/blog/temp-content.json'

async function getInitialContent() {
  // Simulate DB fetch delay
  await new Promise((resolve) => setTimeout(resolve, 2000))
  
  // return {
  //   type: 'doc',
  //   content: [
  //     {
  //       type: 'paragraph',
  //       content: [{ type: 'text', text: 'Start writing your blog post...' }]
  //     }
  //   ]
  // }

  return content
}

export default async function NewPostPage() {
  const session = await getSession()
  const initialContent = await getInitialContent()

  if (!session || !session.isAdmin) {
    // notFound()
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">New Blog Post</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<div className="w-full h-[600px] animate-pulse bg-gray-100 rounded-md" />}>
            <SimpleEditor initialContent={initialContent} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  )
}
