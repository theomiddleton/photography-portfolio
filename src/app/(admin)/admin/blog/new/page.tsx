import { notFound } from 'next/navigation'
import { getSession } from '~/lib/auth/auth'

export default async function NewPostPage() {
  const session = await getSession()

  if (!session || !session.isAdmin) {
    notFound()
  }
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">New Blog Post</h1>
    </main>
  )
}
