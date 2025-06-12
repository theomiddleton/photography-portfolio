import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '~/server/db'
import { blogPosts } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '~/lib/auth/auth'
import { TipTapRenderer } from '~/components/blog/tiptap-renderer'
import { formatDate } from '~/lib/utils'
import { CalendarIcon, ArrowLeft, Edit } from 'lucide-react'
import { Button } from '~/components/ui/button'

// This route is always dynamic
export const dynamic = 'force-dynamic'

interface PreviewPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PreviewPostPageProps): Promise<Metadata> {
  const post = await db
    .select({ title: blogPosts.title, description: blogPosts.description })
    .from(blogPosts)
    .where(eq(blogPosts.slug, (await params).slug))
    .limit(1)
    .then((rows) => rows[0])

  if (!post) {
    return {
      title: 'Post Not Found | Preview',
      robots: 'noindex, nofollow',
    }
  }

  return {
    title: `${post.title} | Preview`,
    description: post.description
      ? `${post.description} | Preview (unpublished)`
      : 'Preview of blog post',
    robots: 'noindex, nofollow', // Important for SEO to not index previews
  }
}

export default async function PreviewPostPage({
  params,
}: PreviewPostPageProps) {
  const session = await getSession()

  if (!session?.role || session.role !== 'admin') {
    notFound()
  }

  const postResults = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      content: blogPosts.content,
      description: blogPosts.description,
      published: blogPosts.published,
      slug: blogPosts.slug,
      publishedAt: blogPosts.publishedAt,
      updatedAt: blogPosts.updatedAt,
      authorId: blogPosts.authorId,
    })
    .from(blogPosts)
    .where(eq(blogPosts.slug, (await params).slug))
    .limit(1)

  if (!postResults.length) {
    notFound()
  }

  const blogPost = postResults[0]

  let content
  try {
    content = JSON.parse(blogPost.content)
  } catch (parseError) {
    console.error('Error parsing blog post content for preview:', parseError)
    content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Error loading content.' }],
        },
      ],
    }
  }

  return (
    <article className="container mx-auto mt-12 max-w-4xl px-4 py-12">
      <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-100 p-4">
        <p className="font-medium text-yellow-800">
          📝 This is a preview. (Admin only) -{' '}
          {blogPost.published ? 'Published Post' : 'Unpublished Draft'}
        </p>
      </div>

      <div className="space-y-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          <Link href={`/admin/blog/edit/${blogPost.slug}`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit post
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {blogPost.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {blogPost.publishedAt && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <time dateTime={blogPost.publishedAt.toISOString()}>
                  {formatDate(blogPost.publishedAt)} (Published)
                </time>
              </div>
            )}
            {!blogPost.publishedAt && blogPost.updatedAt && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <time dateTime={blogPost.updatedAt.toISOString()}>
                  Last updated: {formatDate(blogPost.updatedAt)}
                </time>
              </div>
            )}
            {blogPost.description && (
              <p className="text-sm italic">{blogPost.description}</p>
            )}
          </div>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <TipTapRenderer content={content} />
        </div>
      </div>
    </article>
  )
}
