import { type NextRequest, NextResponse } from 'next/server'
import {
  getImageById,
  updateImage,
  deleteImage,
  toggleImageVisibility,
} from '~/lib/actions/image'
import { getSession } from '~/lib/auth/auth'

// GET /api/images/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: paramId } = await params
  const id = Number.parseInt(paramId)

  const session = await getSession()
  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const { image, error } = await getImageById(id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  return NextResponse.json({ image })
}

// PATCH /api/images/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: paramId } = await params
  const id = Number.parseInt(paramId)

  const session = await getSession()
  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const body = await request.json()

    // Check if this is a visibility toggle request
    if (Object.keys(body).length === 1 && 'toggleVisibility' in body) {
      const { image, error } = await toggleImageVisibility(id)

      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }

      return NextResponse.json({ image })
    }

    // Regular update
    const { image, error } = await updateImage(id, body)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return NextResponse.json({ image })
  } catch (error) {
    console.error(`Error in PATCH /api/images/${id}:`, error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// DELETE /api/images/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: paramId } = await params
  const id = Number.parseInt(paramId)

  const session = await getSession()
  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const { success, error } = await deleteImage(id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  if (!success) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
