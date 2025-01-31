import { db } from '~/server/db'
import { customPages } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PageForm } from '~/components/pages/page-form'
import { updateCustomPage } from '~/lib/actions/customPages'
import { revalidatePath } from 'next/cache'
import { Logger } from 'next-axiom'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditCustomPage(props: { params: Promise<{ id: number }> }) {
  const params = await props.params;
  noStore()
  const log = new Logger()

  try {
    const page = await db
      .select()
      .from(customPages)
      .where(eq(customPages.id, params.id))
      .limit(1)
      .then(res => res[0])
    
    log.info('page fetch attempt', { pageId: params.id, success: !!page })

    if (!page) {
      log.warn('page not found', { pageId: params.id })
      notFound()
    }

    const updatePageWithId = async (formData: FormData) => {
      'use server'
      await updateCustomPage(params.id, formData)
      revalidatePath(`/admin/pages/${params.id}/edit`)
      revalidatePath('/admin/pages')
    }

    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Page</h1>
        <PageForm page={page} action={updatePageWithId} key={page.updatedAt.toString()} />
      </div>
    )
  } catch (error) {
    log.error('error fetching page', { pageId: params.id, error })
    throw error
  }
}