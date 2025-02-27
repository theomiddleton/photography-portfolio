import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { blogPosts, users } from '~/server/db/schema'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote'
import { Card, CardContent } from '~/components/ui/card'
import type { Metadata } from 'next'
import { siteConfig } from '~/config/site'

// revalidate pages for new blog posts every minute
export const revalidate = 60
export const dynamicParams = true

// Generate metadata for the page
export async function generateMetadata(props: {
  params: { slug: string }
}): Promise<Metadata> {
  const { slug } = props.params

  // fetch blog post data from the database
  const [post] = await db
    .select({
      title: blogPosts.title,
      description: blogPosts.description,
      authorName: users.name,
    })
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .limit(1)

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    }
  }

  const canonicalUrl = `${siteConfig.url}/blog/${slug}`

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.authorName }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      authors: [post.authorName],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function BlogPost(props: { params: { slug: string } }) {
  const { slug } = props.params

  // fetch blog post data from the database
  const [post] = await db
    .select({
      title: blogPosts.title,
      content: blogPosts.content,
      description: blogPosts.description,
      publishedAt: blogPosts.publishedAt,
      authorName: users.name,
    })
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .limit(1)

  if (!post) {
    notFound()
  }

  return (
    <article className="container mx-auto py-8">
      <Card>
        <CardContent className="p-6">
          <header className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>
            {post.description && (
              <p className="mb-4 text-lg text-muted-foreground">
                {post.description}
              </p>
            )}
            <div className="text-sm text-muted-foreground">
              <span>By {post.authorName}</span>
              {post.publishedAt && (
                <time
                  dateTime={post.publishedAt.toISOString()}
                  className="ml-4"
                >
                  {post.publishedAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}
            </div>
          </header>
          <div className="prose prose-stone max-w-none dark:prose-invert">
            <MDXRemote source={post.content} />
          </div>
        </CardContent>
      </Card>
    </article>
  )
}
