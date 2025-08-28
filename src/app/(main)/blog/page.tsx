import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '~/server/db'
import { desc, and, eq } from 'drizzle-orm'
import { blogPosts } from '~/server/db/schema'
import { formatDistance } from 'date-fns'
import { siteConfig } from '~/config/site'

const POSTS_PER_PAGE = 10

export const metadata: Metadata = {
  title: `Photography Blog | ${siteConfig.ownerName}`,
  description: `Read the latest photography blog posts by ${siteConfig.ownerName}. Discover photography tips, behind-the-scenes stories, gear reviews, and artistic insights from a professional photographer.`,
  keywords: [
    'photography blog',
    'photography tips',
    'photographer insights',
    `${siteConfig.ownerName} blog`,
    'photography tutorials',
    'photography stories',
    'photography techniques',
    'camera gear reviews',
    'photography inspiration',
    'behind the scenes photography'
  ].join(', '),
  authors: [{ name: siteConfig.ownerName }],
  creator: siteConfig.ownerName,
  openGraph: {
    title: `Photography Blog | ${siteConfig.ownerName}`,
    description: `Explore photography insights, tips, and stories from professional photographer ${siteConfig.ownerName}.`,
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.seo.openGraph.siteName,
    images: siteConfig.seo.openGraph.images,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Photography Blog | ${siteConfig.ownerName}`,
    description: `Explore photography insights, tips, and stories from professional photographer ${siteConfig.ownerName}.`,
    images: siteConfig.seo.openGraph.images,
  },
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedParams = await searchParams
  const currentPage = Number(resolvedParams.page) || 1
  const offset = (currentPage - 1) * POSTS_PER_PAGE

  const posts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      description: blogPosts.description,
      slug: blogPosts.slug,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .where(and(eq(blogPosts.published, true)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(POSTS_PER_PAGE)
    .offset(offset)

  const totalPosts = await db
    .select({ count: blogPosts.id })
    .from(blogPosts)
    .where(and(eq(blogPosts.published, true)))
    .then((res) => res.length)

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)

  return (
    <div className="container mx-auto px-4 pb-8 pt-20">
      <h1 className="mb-8 text-4xl font-bold">Blog</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
          >
            <Link href={`/blog/${post.slug}`}>
              <h2 className="mb-2 text-2xl font-semibold text-gray-900 hover:text-black">
                {post.title}
              </h2>
            </Link>
            {post.description && (
              <p className="mb-4 text-gray-600">{post.description}</p>
            )}
            <div className="text-sm text-gray-500">
              {post.publishedAt &&
                formatDistance(new Date(post.publishedAt), new Date(), {
                  addSuffix: true,
                })}
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/blog?page=${currentPage - 1}`}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Previous
            </Link>
          )}
          {currentPage < totalPages && (
            <Link
              href={`/blog?page=${currentPage + 1}`}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Next
            </Link>
          )}
        </div>
      )}

      {posts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-600">No blog posts available.</p>
        </div>
      )}
    </div>
  )
}
