import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '~/server/db'
import { blogPosts } from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { getSession } from '~/lib/auth/auth'
import { TipTapRenderer } from '~/components/blog/tiptap-renderer'
import { formatDate } from '~/lib/utils'
import { CalendarIcon, ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { siteConfig } from '~/config/site'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  try {
    // Only generate static params for PUBLISHED blog posts
    const publishedPosts = await db
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))

    // Log the results for debugging
    console.log('Generated static params for blog posts:', publishedPosts.length)
    
    // Ensure we return an array of valid slug objects
    return publishedPosts
      .filter(post => post.slug && typeof post.slug === 'string' && post.slug.trim() !== '')
      .map((post) => ({
        slug: post.slug,
      }))
  } catch (error) {
    console.error('Error generating static params for blog posts:', error)
    // Return empty array if database is not available during build
    return []
  }
}

// Force static generation for known routes
export const dynamic = 'force-static'
// Allow dynamic params for unpublished posts (for admin preview)
export const dynamicParams = true

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const post = await db
      .select({
        title: blogPosts.title,
        description: blogPosts.description,
      })
      .from(blogPosts)
      .where(eq(blogPosts.slug, resolvedParams.slug))
      .limit(1)
      .then(rows => rows[0])

    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.',
      }
    }

    return {
      title: post.title,
      description: post.description || '',
      openGraph: {
        title: post.title,
        description: post.description || '',
        images: siteConfig.seo.openGraph.images,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description || '',
        images: siteConfig.seo.openGraph.images,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Blog Post',
      description: 'A blog post',
    }
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params
  
  try {
    const post = await db
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
      .where(eq(blogPosts.slug, resolvedParams.slug))
      .limit(1)

    // If post not found, return 404
    if (!post.length) {
      notFound()
    }

    const session = await getSession()
    const blogPost = post[0]
    
    // Check if post should be accessible
    if (!blogPost.published && (!session || session.role !== 'admin')) {
      notFound()
    }
    
    // Parse the TipTap JSON content safely
    let content
    try {
      content = JSON.parse(blogPost.content)
    } catch (parseError) {
      console.error('Error parsing blog post content:', parseError)
      content = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Error loading content.' }] }] }
    }

    return (
      <article className="container max-w-4xl mx-auto px-4 py-12 mt-12">
        <div className="space-y-8">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to posts
              </Button>
            </Link>
            {session && session.role === 'admin' && (
              <Link href={`/admin/blog/edit/${blogPost.slug}`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit post
                </Button>
              </Link>
            )}
          </div>
          
          {/* Post Header */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{blogPost.title}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {/* Publication Date */}
              {blogPost.publishedAt && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <time dateTime={blogPost.publishedAt.toISOString()}>
                    {formatDate(blogPost.publishedAt)}
                  </time>
                </div>
              )}
              {/* Description */}
              {blogPost.description && (
                <p className="text-sm italic">
                  {blogPost.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Post Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <TipTapRenderer content={content} />
          </div>
        </div>
      </article>
    )
  } catch (error) {
    console.error('Error loading blog post:', error)
    notFound()
  }
}
