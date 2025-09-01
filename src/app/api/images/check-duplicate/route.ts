import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '~/lib/auth/session'
import { db } from '~/server/db'
import { imageData, customImgData, galleryImages } from '~/server/db/schema'
import { eq, or } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.role || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { fileName, fileUrl } = await request.json()

    if (!fileName || !fileUrl) {
      return NextResponse.json(
        { error: 'fileName and fileUrl are required' },
        { status: 400 }
      )
    }

    // Check for duplicates across all image tables
    const [mainDuplicate] = await db
      .select({ id: imageData.id, fileName: imageData.fileName })
      .from(imageData)
      .where(or(
        eq(imageData.fileName, fileName),
        eq(imageData.fileUrl, fileUrl)
      ))
      .limit(1)

    if (mainDuplicate) {
      return NextResponse.json({
        isDuplicate: true,
        source: 'main',
        existingImage: mainDuplicate
      })
    }

    const [customDuplicate] = await db
      .select({ id: customImgData.id, fileName: customImgData.fileName })
      .from(customImgData)
      .where(or(
        eq(customImgData.fileName, fileName),
        eq(customImgData.fileUrl, fileUrl)
      ))
      .limit(1)

    if (customDuplicate) {
      return NextResponse.json({
        isDuplicate: true,
        source: 'custom',
        existingImage: customDuplicate
      })
    }

    const [galleryDuplicate] = await db
      .select({ id: galleryImages.id, fileName: galleryImages.fileName })
      .from(galleryImages)
      .where(or(
        eq(galleryImages.fileName, fileName),
        eq(galleryImages.fileUrl, fileUrl)
      ))
      .limit(1)

    if (galleryDuplicate) {
      return NextResponse.json({
        isDuplicate: true,
        source: 'gallery',
        existingImage: galleryDuplicate
      })
    }

    return NextResponse.json({
      isDuplicate: false
    })

  } catch (error) {
    console.error('Error checking for duplicates:', error)
    return NextResponse.json(
      { error: 'Failed to check for duplicates' },
      { status: 500 }
    )
  }
}
