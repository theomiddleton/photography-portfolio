import Link from 'next/link'
import { PenIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'

import { BlogsTable } from '~/components/blog/blog-table'

export const dynamic = 'force-dynamic'
// export const revalidate = 0

export default function Blog() {
  return (
    <div className="min-h-screen bg-white text-black space-y-12">
      <BlogsTable />
      <Card className="hover:bg-muted/50 transition-colors">
        <Link href='/admin/blog/newpost' className="block h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">New Post</CardTitle>
              <PenIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Create a new blog posts</CardDescription>
          </CardHeader>
        </Link>
      </Card>
    </div>
  )
}