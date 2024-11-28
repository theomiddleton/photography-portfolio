import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'

import { db } from '~/server/db'
import { blogs } from '~/server/db/schema'

import type { Post } from '~/lib/types/Post'

export default async function Blog() {
  const allPosts: Post[] = await db.select().from(blogs)
  
  // Filter out draft posts
  const publishedPosts = allPosts.filter(post => !post.isDraft)
  
  if (publishedPosts.length <= 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Latest Blog Posts</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <p>No posts found.</p>
        </div>
      </div>
    )
  }

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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Latest Blog Posts</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publishedPosts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">
                  <Link href={`/blog/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {formatDate(post.createdAt)}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
    </div>
  )
}