import { Metadata } from 'next'
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
import type { BlogPostWithImages } from '~/lib/types/blog'
import { TipTapRenderer } from '~/components/blog/tiptap-renderer'

interface PostPageProps {
  params: {
    slug: string
  }
}

// Enable Incremental Static Regeneration with a revalidation period of 60 seconds
export const revalidate = 60

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params)  // Await the params

  const post = (await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1)
    .then((rows) => rows[0] || null)) as BlogPostWithImages | null

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.description || undefined,
    openGraph: {
      title: post.title,
      description: post.description || undefined,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await Promise.resolve(params)

  const post = (await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1)
    .then((rows) => rows[0] || null)) as BlogPostWithImages | null

  if (!post) {
    notFound()
  }

  const session = await getSession()

  if (!post || (!post.published && (!session || !session.isAdmin))) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 pb-10 pt-20">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/blog">
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

        <TipTapRenderer content={JSON.parse(post.content)} />
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
