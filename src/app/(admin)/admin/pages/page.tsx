import { getCustomPages } from '~/lib/actions/customPages'
import { Button } from '~/components/ui/button'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { PagesTable } from '~/components/pages/page-table'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Custom Pages - Admin',
  description: 'Manage custom pages and content',
}

export default async function PagesAdmin() {
  const pages = await getCustomPages()

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Custom Pages</h1>
        <Link href="/admin/pages/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Page
          </Button>
        </Link>
      </div>
      <PagesTable pages={pages} />
    </div>
  )
}
