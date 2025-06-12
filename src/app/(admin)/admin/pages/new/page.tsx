import { PageForm } from '~/components/pages/page-form'
import { createCustomPage } from '~/lib/actions/customPages'

export default async function NewCustomPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Page</h1>
      <PageForm action={createCustomPage} />
    </div>
  )
}

export const dynamic = 'force-dynamic'