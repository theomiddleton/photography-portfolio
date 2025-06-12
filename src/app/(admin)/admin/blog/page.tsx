import React from 'react'
import { db } from '~/server/db'
import { desc } from 'drizzle-orm'
import { blogPosts } from '~/server/db/schema'  
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { formatDistance } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

// Set revalidation to 0 for real-time updates
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

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{post.title}</span>
                      <span className="truncate text-sm text-gray-500">
                        {post.excerpt}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDistance(new Date(post.updatedAt), new Date(), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Link
                      href={`/admin/blog/edit/${post.slug}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <Link
                      href={post.published ? `/blog/${post.slug}` : `/blog/p/${post.slug}`}
                      className="text-gray-600 hover:text-gray-900"
                      target="_blank"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {posts.length === 0 && (
        <Card className="mt-4">
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">
              No blog posts yet. Create your first post!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
