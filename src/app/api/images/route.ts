import { type NextRequest, NextResponse } from 'next/server'
import { getImages, createImage, updateImagesOrder } from '~/lib/actions/image'
import { getSession } from '~/lib/auth/auth'

// GET /api/images
export async function GET(request: NextRequest) {
  const session = await getSession()
  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }
  
  const searchParams = request.nextUrl.searchParams
  const visible = searchParams.get('visible')
  const sortBy = (searchParams.get('sortBy') as any) || 'order'
  const sortDirection = (searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc'
  const limit = searchParams.get('limit') ? Number.parseInt(searchParams.get('limit')!) : undefined
  const offset = searchParams.get('offset') ? Number.parseInt(searchParams.get('offset')!) : 0

  const { images, error } = await getImages({
    visible: visible === 'true' ? true : visible === 'false' ? false : undefined,
    sortBy,
    sortDirection,
    limit,
    offset,
  })

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ images })
}

// POST /api/images
export async function POST(request: NextRequest) {
  const session = await getSession()
  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }
  try {
    const body = await request.json()
    const { image, error } = await createImage(body)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ image }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/images:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// PATCH /api/images/order
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }
  try {
    const body = await request.json()

    // Check if this is an order update request
    if (Array.isArray(body) && body.length > 0 && 'id' in body[0] && 'order' in body[0]) {
      const { images, error } = await updateImagesOrder(body)

      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }

      return NextResponse.json({ images })
    }

    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
  } catch (error) {
    console.error('Error in PATCH /api/images/order:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
