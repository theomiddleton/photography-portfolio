import React from 'react'
import { db } from '~/server/db'
import { desc } from 'drizzle-orm'
import { blogPosts } from '~/server/db/schema'  
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { formatDistance } from 'date-fns'

export const revalidate = 0

export default async function AdminBlogPage() {
  const posts = await db
    .select({
      id: blogPosts.id,   
      title: blogPosts.title,
      slug: blogPosts.slug, 
      excerpt: blogPosts.description,
      published: blogPosts.published,
      publishedAt: blogPosts.publishedAt,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.updatedAt))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Blog Posts</h1>
        <Link href="/admin/blog/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-500">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-black/5">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{post.title}</span>
                      <span className="truncate text-sm text-gray-500">
                        {post.excerpt}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDistance(new Date(post.updatedAt), new Date(), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="space-x-2 px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/admin/blog/edit/${post.slug}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-gray-600 hover:text-gray-900"
                      target="_blank"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {posts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-600">
            No blog posts yet. Create your first post!
          </p>
        </div>
      )}
    </div>
  )
}
