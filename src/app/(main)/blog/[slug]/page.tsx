import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '~/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import { getPublishedPosts } from '~/lib/actions/blog-actions'
import { formatDate } from '~/lib/utils'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { db } from '~/server/db'
import { blogPosts } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '~/lib/auth/auth'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PostPage({ params }: PostPageProps) {
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

  const session = await getSession()

  if (!post || !post.published) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 pb-10 pt-20">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to posts
          </Button>
        </Link>
        {session && session.role === 'admin' && (
          <Link href={`/admin/blog/edit/${post.slug}`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit post
            </Button>
          </Link>
        )}
      </div>
      <article className="prose prose-lg mx-auto max-w-4xl dark:prose-invert">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatDate(post.publishedAt || post.createdAt)}
          </p>
        </div>

        {post.description && (
          <p className="mb-8 text-xl italic text-muted-foreground">
            {post.description}
          </p>
        )}

        <MDXRemote source={post.content} />
      </article>
    </main>
  )
}

// Generate static params for all published posts
export async function generateStaticParams() {
  const posts = await getPublishedPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}
