import { type NextRequest, NextResponse } from 'next/server'
import { getImageById, updateImage, deleteImage, toggleImageVisibility } from '~/lib/actions/image'

// GET /api/images/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  const { image, error } = await getImageById(id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 })
  }

  return NextResponse.json({ image })
}

// PATCH /api/images/[id]
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  try {
    const body = await request.json()

    // Check if this is a visibility toggle request
    if (Object.keys(body).length === 1 && "toggleVisibility" in body) {
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
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    return NextResponse.json({ image })
  } catch (error) {
    console.error(`Error in PATCH /api/images/${id}:`, error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

// DELETE /api/images/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  const { success, error } = await deleteImage(id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  if (!success) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
