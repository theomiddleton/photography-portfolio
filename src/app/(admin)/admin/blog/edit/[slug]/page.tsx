import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { BlogForm } from '~/components/blog/blog-form'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { blogPosts } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

interface EditBlogPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    notFound()
  }

  const { slug } = await params
  const post = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1)
    .then((rows) => rows[0] || null)

  if (!post) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Edit Blog Post</h1>
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
        <BlogForm initialContent={post.content} post={post} />
      </Suspense>
    </main>
  )
}
