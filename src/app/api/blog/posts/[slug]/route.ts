import { NextResponse } from 'next/server'
import { updatePost } from '~/lib/actions/blog-actions'
import { getSession } from '~/lib/auth/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json()
    const post = await updatePost(resolvedParams.slug, {
      ...body,
      authorId: session.id,
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to update post:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}