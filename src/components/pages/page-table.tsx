'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { customPages } from '~/server/db/schema'
import { deleteCustomPage } from '~/lib/actions/customPages'
import { EyeIcon, PencilIcon, TrashIcon } from 'lucide-react'
import Link from 'next/link'

export type CustomPage = typeof customPages.$inferSelect
export type NewCustomPage = typeof customPages.$inferInsert

export function PagesTable({ pages }: { pages: CustomPage[] }) {
  const [optimisticPages, setOptimisticPages] = useState(pages)

  async function handleDelete(id: number) {
    setOptimisticPages(pages.filter(page => page.id !== id))
    await deleteCustomPage(id)
  }

  return (
    <Card>
    <CardHeader>
      <CardTitle>Pages</CardTitle>
    </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticPages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>{page.title}</TableCell>
                <TableCell>{page.slug}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    page.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell>{new Date(page.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/p/${page.slug}`}>
                      <Button variant="ghost" size="icon">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/pages/${page.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(page.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

