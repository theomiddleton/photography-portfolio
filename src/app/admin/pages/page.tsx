import { getCustomPages } from '~/lib/actions/customPages'
import { Button } from '~/components/ui/button'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { PagesTable } from '~/components/pages/page-table'

export default async function PagesAdmin() {
  const pages = await getCustomPages()

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Custom Pages</h1>
        <Link href="/admin/pages/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </Link>
      </div>
      <PagesTable pages={pages} />
    </div>
  )
}