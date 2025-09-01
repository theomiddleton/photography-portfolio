import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { duplicateFiles } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.role || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 },
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Calculate file hash
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex')

    // Check if file hash exists in duplicate tracking table
    const existingFiles = await db
      .select()
      .from(duplicateFiles)
      .where(eq(duplicateFiles.fileHash, hash))

    if (existingFiles.length > 0) {
      // File already exists, return existing file info
      const existing = existingFiles[0]
      return NextResponse.json({
        isDuplicate: true,
        existingFile: {
          hash: existing.fileHash,
          fileName: existing.fileName,
          bucketName: existing.bucketName,
          objectKey: existing.objectKey,
          fileSize: existing.fileSize,
          dbReference: existing.dbReference,
          uuid: existing.uuid,
        },
        message: 'File already exists in storage',
      })
    }

    // File is unique
    return NextResponse.json({
      isDuplicate: false,
      fileHash: hash,
      fileName: file.name,
      fileSize: file.size,
      message: 'File is unique and can be uploaded',
    })
  } catch (error) {
    console.error('Error checking for duplicate file:', error)
    return NextResponse.json(
      { error: 'Failed to check for duplicate file' },
      { status: 500 }
    )
  }
}