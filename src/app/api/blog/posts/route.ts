import { NextResponse } from 'next/server'
import { createPost } from '~/lib/actions/blog-actions'
import { getSession } from '~/lib/auth/auth'

export async function POST(request: Request) {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json()
    const post = await createPost({
      ...body,
      authorId: session.id,
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to create post:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
