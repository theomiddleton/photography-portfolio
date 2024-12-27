import { db } from '~/server/db'
import { customPages } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PageForm } from '~/components/pages/page-form'
import { updateCustomPage } from '~/lib/actions/customPages'

export default async function EditCustomPage({ params }: { params: { id: number } }) {
  const page = await db
    .select()
    .from(customPages)
    .where(eq(customPages.id, params.id))
    .limit(1)
    .then(res => res[0])

  if (!page) {
    notFound()
  }

  const updatePageWithId = async (formData: FormData) => {
    'use server'
    await updateCustomPage(params.id, formData)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Page</h1>
      <PageForm page={page} action={updatePageWithId} />
    </div>
  )
}

