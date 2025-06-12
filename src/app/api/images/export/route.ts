import { NextResponse } from 'next/server'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { getSession } from '~/lib/auth/auth'

export async function GET() {
  const session = await getSession()

  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }

  try {
    // Fetch all image data from the database
    const images = await db.select().from(imageData)
    
    return NextResponse.json(images, { status: 200 })
  } catch (error) {
    console.error('Error exporting image data:', error)
    return NextResponse.json(
      { error: 'Failed to export image data' },
      { status: 500 },
    )
  }
}