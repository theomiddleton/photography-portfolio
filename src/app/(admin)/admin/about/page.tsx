import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { BlogForm } from '~/components/blog/blog-form'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { about, aboutImages } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '~/components/ui/button'
import { ChevronLeft, Eye } from 'lucide-react'
import Link from 'next/link'
import { AboutForm } from '~/components/about/about-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Management - Admin',
  description: 'Manage about page content',
}

export default async function EditAboutPage() {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    notFound()
  }

  const result = await db.select({
    id: about.id,
    title: about.title,
    content: about.content,
  })
  .from(about)
  .where(eq(about.current, true))
  .limit(1)

  if (result.length === 0) {
    return null
  }

  return (
    <main className="mx-auto px-4 py-10">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="flex-1 text-xl font-semibold tracking-tight">
            Edit About Page
          </h1>
          <Link
            href='/about'
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="w-full animate-pulse space-y-4">
              <div className="h-10 rounded-md bg-gray-100" />
              <div className="h-20 rounded-md bg-gray-100" />
              <div className="h-10 rounded-md bg-gray-100" />
              <div className="h-[600px] rounded-md bg-gray-100" />
            </div>
          }
        >
          <AboutForm initialContent={result[0].content} />
        </Suspense>
      </div>
    </main>
  )
}
