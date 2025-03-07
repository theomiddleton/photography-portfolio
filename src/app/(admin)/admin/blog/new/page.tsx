import { BlogEditor } from '~/components/blog/editor'
import { getSession } from '~/lib/auth/auth'
const session = await getSession()

const user = session

export default function NewPostPage() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">New Blog Post</h1>
      <BlogEditor session={user} />
    </main>
  )
}
