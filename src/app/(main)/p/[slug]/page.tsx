import { getCustomPage } from '~/lib/actions/customPages'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { components } from '~/components/pages/mdx-components/mdx-components'

export const revalidate = 3600

export default async function CustomPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const page = await getCustomPage(params.slug)

  if (!page || !page.isPublished) {
    notFound()
  }

  return (
    <main className="flex min-h-screen flex-col bg-white text-black">      
      <div className="flex-1 pt-20">
        <div className="container mx-auto px-4">
          <article className="mx-auto max-w-2xl pb-24">
            <h1 className="text-4xl font-bold mb-8 break-words">{page.title}</h1>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="break-words overflow-hidden">
                <MDXRemote 
                  source={page.content} 
                  components={components}
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}

