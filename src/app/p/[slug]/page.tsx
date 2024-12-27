import { getCustomPage } from '~/lib/actions/customPages'
import { notFound } from 'next/navigation'

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const page = await getCustomPage(params.slug)

  if (!page || !page.isPublished) {
    notFound()
  }

  return (
    <article className="container py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
      <div className="prose prose-lg max-w-none">
        {page.content}
      </div>
    </article>
  )
}

