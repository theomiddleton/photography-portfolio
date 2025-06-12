import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarIcon } from 'lucide-react'
import { db } from '~/server/db'
import { blogPosts } from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { TipTapRenderer } from '~/components/blog/tiptap-renderer'
import { formatDate } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { siteConfig } from '~/config/site'
import { EditPostButtonClient } from '~/components/blog/edit-post-button-client' // For edit button on static page

export const dynamicParams = true // Keep this if you want to allow slugs not generated at build time to try and render (will 404 if not published)

interface PostPageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all PUBLISHED blog posts
export async function generateStaticParams() {
  try {
    const publishedPosts = await db
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))

    console.log(
      '[Static] Generated static params for blog posts:',
      publishedPosts.length,
    )
    return publishedPosts
      .filter(
        (post) =>
          post.slug && typeof post.slug === 'string' && post.slug.trim() !== '',
      )
      .map((post) => ({
        slug: post.slug,
      }))
  } catch (error) {
    console.error(
      '[Static] Error generating static params for blog posts:',
      error,
    )
    return []
  }
}

// Generate metadata for PUBLISHED SEO
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  try {
    // Fetch only published post for metadata
    const post = await db
      .select({
        title: blogPosts.title,
        description: blogPosts.description,
        // published: blogPosts.published, // No longer needed to check here, query ensures it
      })
      .from(blogPosts)
      .where(
        and(eq(blogPosts.slug, (await params).slug), eq(blogPosts.published, true)),
      ) // Ensure published
      .limit(1)
      .then((rows) => rows[0])

    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.',
      }
    }

    // Metadata for published posts
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
    console.error('[Static] Error generating metadata:', error)
    return {
      title: 'Blog Post',
      description: 'A blog post',
    }
  }
}

export default async function StaticPostPage({ params }: PostPageProps) {
  const { slug } = await params

  try {
    // Fetch ONLY published posts
    const postResults = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        content: blogPosts.content,
        description: blogPosts.description,
        // published: blogPosts.published, // Not needed in select, assumed true
        slug: blogPosts.slug,
        publishedAt: blogPosts.publishedAt,
        updatedAt: blogPosts.updatedAt,
        authorId: blogPosts.authorId,
      })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true))) // Crucial: only published
      .limit(1)

    if (!postResults.length) {
      notFound() // Will 404 if post not found OR not published
    }

    const blogPost = postResults[0]
    // No serverSession logic needed here, this page is for static published content.

    let content
    try {
      content = JSON.parse(blogPost.content)
    } catch (parseError) {
      console.error('[Static] Error parsing blog post content:', parseError)
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
        {/* No unpublished banner needed here */}
        <div className="space-y-8">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to posts
              </Button>
            </Link>
            {/* Edit button for admins, handled client-side for static pages */}
            <EditPostButtonClient slug={blogPost.slug} />
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
    console.error('[Static] Error loading blog post:', error)
    notFound()
  }
}
