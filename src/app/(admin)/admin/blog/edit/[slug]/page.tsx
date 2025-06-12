import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { BlogForm } from '~/components/blog/blog-form'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { blogPosts } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '~/components/ui/button'
import { ChevronLeft, Eye } from 'lucide-react'
import Link from 'next/link'

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
    <main className="mx-auto px-4 py-10">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="flex-1 text-xl font-semibold tracking-tight">
            Edit Blog Post
          </h1>
          <Link
            href={`/blog${post.published ? '' : '/p'}/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </Link>
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
          <BlogForm initialContent={post.content} post={post} />
        </Suspense>
      </div>
    </main>
  )
}
