import { notFound } from 'next/navigation'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { blogPosts } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

interface EditBlogPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { slug } = await params
  const post = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1)
    .then((rows) => rows[0] || null)

  if (!post) {
    notFound()
  }

  const session = await getSession()

  if (!session || !session.isAdmin) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Edit Blog Post</h1>
    </main>
  )
}
