import { NextRequest, NextResponse } from 'next/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { db } from '~/server/db'
import { duplicateFiles } from '~/server/db/schema'
import { inArray, eq } from 'drizzle-orm'
import { getSession } from '~/lib/auth/auth'

const BUCKET_NAMES_MAP: Record<string, string> = {
  'Main Images': process.env.R2_IMAGE_BUCKET_NAME || '',
  'Blog Images': process.env.R2_BLOG_IMG_BUCKET_NAME || '',
  'About Images': process.env.R2_ABOUT_IMG_BUCKET_NAME || '',
  'Custom Images': process.env.R2_CUSTOM_IMG_BUCKET_NAME || '',
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileIds } = await request.json()

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: 'No file IDs provided' },
        { status: 400 }
      )
    }

    // Get file details from database
    const filesToDelete = await db
      .select()
      .from(duplicateFiles)
      .where(inArray(duplicateFiles.id, fileIds))

    let deletedCount = 0
    const errors: string[] = []

    for (const file of filesToDelete) {
      try {
        // Map display name back to actual bucket name
        const bucketName = BUCKET_NAMES_MAP[file.bucketName] || file.bucketName

        if (!bucketName) {
          errors.push(`Unknown bucket: ${file.bucketName}`)
          continue
        }

        // Delete from R2
        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: file.objectKey,
        })

        await r2.send(deleteCommand)

        // Remove from duplicate files table
        await db
          .delete(duplicateFiles)
          .where(eq(duplicateFiles.id, file.id))

        deletedCount++
      } catch (error) {
        console.error(`Failed to delete file ${file.fileName}:`, error)
        errors.push(`Failed to delete ${file.fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      errors,
      totalRequested: fileIds.length,
    })
  } catch (error) {
    console.error('Failed to delete duplicate files:', error)
    return NextResponse.json(
      { error: 'Failed to delete duplicate files' },
      { status: 500 }
    )
  }
}