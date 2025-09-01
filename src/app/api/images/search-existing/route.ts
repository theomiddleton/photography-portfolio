import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { imageData, customImgData, galleryImages } from '~/server/db/schema'
import { like, or, eq, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.role || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 },
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || ''
    const bucketParam = searchParams.get('bucket') // Optional filter by bucket type
    const bucket = bucketParam === 'all' ? null : bucketParam // Treat 'all' as no filter
    const limitRaw = Number.parseInt(searchParams.get('limit') ?? '50', 10)
    const offsetRaw = Number.parseInt(searchParams.get('offset') ?? '0', 10)
    const limit = Number.isNaN(limitRaw)
      ? 50
      : Math.min(Math.max(limitRaw, 1), 200)
    const offset = Number.isNaN(offsetRaw) ? 0 : Math.max(offsetRaw, 0)

    // Safe date normalization function
    const normalizeDate = (dateValue: any): Date => {
      if (!dateValue) return new Date()
      if (dateValue instanceof Date) return dateValue
      if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue)
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed
      }
      if (typeof dateValue === 'number') {
        const parsed = new Date(dateValue)
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed
      }
      return new Date()
    }

    const results: Array<{
      id: string
      uuid: string
      fileName: string
      fileUrl: string
      name: string
      description?: string
      uploadedAt: Date
      source: 'main' | 'custom' | 'gallery'
      bucketType?: string
    }> = []

    // Search main image gallery
    if (!bucket || bucket === 'image') {
      const mainImages = await db
        .select({
          id: sql<string>`CAST(${imageData.id} AS TEXT)`,
          uuid: imageData.uuid,
          fileName: imageData.fileName,
          fileUrl: imageData.fileUrl,
          name: imageData.name,
          description: imageData.description,
          uploadedAt: imageData.uploadedAt,
        })
        .from(imageData)
        .where(
          query
            ? or(
                like(imageData.name, `%${query}%`),
                like(imageData.fileName, `%${query}%`),
                like(imageData.description, `%${query}%`),
                like(imageData.tags, `%${query}%`),
              )
            : undefined,
        )
        .limit(limit)
        .offset(offset)

      results.push(
        ...mainImages.map((img) => ({
          ...img,
          uploadedAt: normalizeDate(img.uploadedAt),
          source: 'main' as const,
          bucketType: 'image',
        })),
      )
    }

    // Search custom images
    if (!bucket || bucket === 'custom') {
      const customImages = await db
        .select({
          id: sql<string>`CAST(${customImgData.id} AS TEXT)`,
          uuid: customImgData.uuid,
          fileName: customImgData.fileName,
          fileUrl: customImgData.fileUrl,
          name: customImgData.name,
          description: sql<string>`NULL`,
          uploadedAt: customImgData.uploadedAt,
        })
        .from(customImgData)
        .where(
          query
            ? or(
                like(customImgData.name, `%${query}%`),
                like(customImgData.fileName, `%${query}%`),
              )
            : undefined,
        )
        .limit(limit)
        .offset(offset)

      results.push(
        ...customImages.map((img) => ({
          ...img,
          uploadedAt: normalizeDate(img.uploadedAt),
          source: 'custom' as const,
          bucketType: 'custom',
        })),
      )
    }

    // Search gallery images (if they're not duplicates of main images)
    if (!bucket || bucket === 'gallery') {
      const galleryImagesData = await db
        .select({
          id: galleryImages.id,
          uuid: galleryImages.uuid,
          fileName: galleryImages.fileName,
          fileUrl: galleryImages.fileUrl,
          name: galleryImages.name,
          description: galleryImages.description,
          uploadedAt: galleryImages.uploadedAt,
        })
        .from(galleryImages)
        .where(
          query
            ? or(
                like(galleryImages.name, `%${query}%`),
                like(galleryImages.fileName, `%${query}%`),
                like(galleryImages.description, `%${query}%`),
                like(galleryImages.tags, `%${query}%`),
              )
            : undefined,
        )
        .limit(limit)
        .offset(offset)

      results.push(
        ...galleryImagesData.map((img) => ({
          ...img,
          uploadedAt: normalizeDate(img.uploadedAt),
          source: 'gallery' as const,
          bucketType: 'gallery',
        })),
      )
    }

    // Sort by upload date (newest first) and deduplicate by fileUrl
    const uniqueResults = Array.from(
      new Map(results.map((item) => [item.fileUrl, item])).values(),
    ).sort((a, b) => {
      // Safe date comparison - normalize both dates and compare timestamps
      const dateA = normalizeDate(a.uploadedAt)
      const dateB = normalizeDate(b.uploadedAt)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json({
      success: true,
      images: uniqueResults.slice(0, limit),
      total: uniqueResults.length,
    })
  } catch (error) {
    console.error('Error searching existing images:', error)
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 },
    )
  }
}
