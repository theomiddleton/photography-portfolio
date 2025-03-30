import { SiteHeader } from '~/components/site-header'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { components } from '~/components/pages/mdx-components/mdx-components'
import { db } from '~/server/db'
import { blogs } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import type { Metadata, ResolvingMetadata } from 'next'

// Enable ISR with a revalidation period of 1 hour
export const revalidate = 3600
export const dynamicParams = true

// Generate metadata for the page
export async function generateMetadata( { params }: { params: { id: string } }, parent: ResolvingMetadata ): Promise<Metadata> {
  const id = parseInt(params.id, 10)
  
  if (isNaN(id)) {
    return {
      title: 'Blog Post Not Found',
    }
  }

  const post = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1).then(posts => posts[0] || null)

  if (!post || post.isDraft) {
    return {
      title: 'Blog Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
  }
}

// Get a single blog post by ID
async function getBlogPost(id: number) {
  const post = await db.select()
    .from(blogs)
    .where(eq(blogs.id, id))
    .then(posts => posts[0] || null)
  
  return post
}

// Format date for display
const formatDate = (date: Date): string => {
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export default async function BlogPost({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  
  if (isNaN(id)) {
    notFound()
  }

  const post = await getBlogPost(id)

  if (!post || post.isDraft) {
    notFound()
  }

  return (
    <main className="flex min-h-screen flex-col bg-white text-black">
      <SiteHeader />
      <div className="flex-1 pt-20">
        <div className="container mx-auto px-4">
          <article className="mx-auto max-w-2xl pb-24">
            <h1 className="text-4xl font-bold mb-8 break-words">{post.title}</h1>
            <div className="text-sm text-muted-foreground mb-8">
              Published on {formatDate(post.createdAt)}
            </div>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="break-words overflow-hidden">
                <MDXRemote 
                  source={post.content} 
                  components={components}
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}