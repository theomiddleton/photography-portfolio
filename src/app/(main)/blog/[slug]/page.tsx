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

// Allow dynamic params for new posts
export const dynamicParams = true
export const revalidate = 3600 // Revalidate every hour

interface PostPageProps {
  params: Promise<{ slug: string }>
}

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

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params

    const post = await db
      .select({
        title: blogPosts.title,
        description: blogPosts.description,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
      .limit(1)
      .then((rows) => rows[0])

    if (!post) {
      return {
        title: 'Post Not Found | Photography Blog',
        description: 'The requested blog post could not be found.',
      }
    }

    const title = `${post.title} | ${siteConfig.ownerName} Photography Blog`
    const description = post.description || `Read this photography blog post by ${siteConfig.ownerName}. Discover insights, tips, and stories from a professional photographer.`

    return {
      title,
      description,
      keywords: [
        post.title.toLowerCase(),
        'photography blog',
        'photography tips',
        `${siteConfig.ownerName}`,
        'professional photographer',
        'photography insights',
        'photography story'
      ].join(', '),
      authors: [{ name: siteConfig.ownerName }],
      creator: siteConfig.ownerName,
      openGraph: {
        title,
        description,
        url: `${siteConfig.url}/blog/${slug}`,
        siteName: siteConfig.seo.openGraph.siteName,
        images: siteConfig.seo.openGraph.images,
        type: 'article',
        publishedTime: post.publishedAt?.toISOString(),
        authors: [siteConfig.ownerName],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: siteConfig.seo.openGraph.images,
        creator: '@theomiddleton_',
      },
      alternates: {
        canonical: `${siteConfig.url}/blog/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-snippet': -1,
          'max-image-preview': 'large',
        },
      },
    }
  } catch (error) {
    console.error('[Static] Error generating metadata:', error)
    return {
      title: `Blog Post | ${siteConfig.ownerName} Photography`,
      description: `A photography blog post by ${siteConfig.ownerName}`,
    }
  }
}

export default async function StaticPostPage({ params }: PostPageProps) {
  const { slug } = await params

  try {
    const postResults = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        content: blogPosts.content,
        description: blogPosts.description,
        slug: blogPosts.slug,
        publishedAt: blogPosts.publishedAt,
        updatedAt: blogPosts.updatedAt,
        authorId: blogPosts.authorId,
      })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
      .limit(1)

    const blogPost = postResults[0]

    if (!blogPost) {
      notFound()
    }

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
        <div className="space-y-8">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to posts
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
                    {formatDate(blogPost.publishedAt)}
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
  } catch (error) {
    console.error('[Static] Error loading blog post:', error)
    notFound()
  }
}
