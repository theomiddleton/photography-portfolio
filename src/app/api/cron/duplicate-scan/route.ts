import { NextRequest, NextResponse } from 'next/server'
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { db } from '~/server/db'
import { duplicateFiles, imageData, customImgData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { createHash } from 'crypto'

const BUCKET_NAMES = [
  process.env.R2_IMAGE_BUCKET_NAME,
  process.env.R2_BLOG_IMG_BUCKET_NAME,
  process.env.R2_ABOUT_IMG_BUCKET_NAME,
  process.env.R2_CUSTOM_IMG_BUCKET_NAME,
].filter(Boolean) as string[]

const BUCKET_DISPLAY_NAMES: Record<string, string> = {
  [process.env.R2_IMAGE_BUCKET_NAME || '']: 'Main Images',
  [process.env.R2_BLOG_IMG_BUCKET_NAME || '']: 'Blog Images',
  [process.env.R2_ABOUT_IMG_BUCKET_NAME || '']: 'About Images',
  [process.env.R2_CUSTOM_IMG_BUCKET_NAME || '']: 'Custom Images',
}

interface FileInfo {
  key: string
  size: number
  lastModified: Date
  bucket: string
}

async function calculateFileHash(bucket: string, key: string): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
    
    const response = await r2.send(command)
    
    if (!response.Body) {
      return null
    }

    const hash = createHash('sha256')
    const body = response.Body as any
    
    // Handle different body types
    if (body.getReader) {
      // ReadableStream
      const reader = body.getReader()
      let done = false
      
      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          hash.update(value)
        }
      }
    } else if (body.transformToByteArray) {
      // AWS SDK v3 format
      const bytes = await body.transformToByteArray()
      hash.update(bytes)
    } else {
      // Buffer or other format
      hash.update(body)
    }
    
    return hash.digest('hex')
  } catch (error) {
    console.error(`Failed to calculate hash for ${bucket}/${key}:`, error)
    return null
  }
}

async function findDatabaseReference(fileName: string) {
  // Check if this file exists in the imageData table
  const imageRecord = await db
    .select({ id: imageData.id, uuid: imageData.uuid })
    .from(imageData)
    .where(eq(imageData.fileName, fileName))
    .limit(1)

  if (imageRecord.length > 0) {
    return {
      table: 'imageData',
      id: imageRecord[0].id,
      uuid: imageRecord[0].uuid,
    }
  }

  // Check if this file exists in the customImgData table
  const customRecord = await db
    .select({ id: customImgData.id, uuid: customImgData.uuid })
    .from(customImgData)
    .where(eq(customImgData.fileName, fileName))
    .limit(1)

  if (customRecord.length > 0) {
    return {
      table: 'customImgData',
      id: customRecord[0].id,
      uuid: customRecord[0].uuid,
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting duplicate file scan...')

    // Clear existing duplicate records
    await db.delete(duplicateFiles)

    const allFiles: FileInfo[] = []

    // Collect all files from all buckets
    for (const bucketName of BUCKET_NAMES) {
      try {
        let continuationToken: string | undefined

        do {
          const command = new ListObjectsV2Command({
            Bucket: bucketName,
            ContinuationToken: continuationToken,
          })

          const response = await r2.send(command)
          
          if (response.Contents) {
            for (const object of response.Contents) {
              if (object.Key && object.Size && object.LastModified) {
                allFiles.push({
                  key: object.Key,
                  size: object.Size,
                  lastModified: object.LastModified,
                  bucket: bucketName,
                })
              }
            }
          }

          continuationToken = response.NextContinuationToken
        } while (continuationToken)
      } catch (error) {
        console.error(`Error scanning bucket ${bucketName}:`, error)
      }
    }

    console.log(`Found ${allFiles.length} total files across all buckets`)

    // Group files by size (potential duplicates)
    const sizeGroups = new Map<number, FileInfo[]>()
    
    for (const file of allFiles) {
      if (!sizeGroups.has(file.size)) {
        sizeGroups.set(file.size, [])
      }
      sizeGroups.get(file.size)!.push(file)
    }

    // Only process groups with more than one file
    const potentialDuplicateGroups = Array.from(sizeGroups.entries())
      .filter(([size, files]) => files.length > 1)

    console.log(`Found ${potentialDuplicateGroups.length} size groups with potential duplicates`)

    let duplicatesFound = 0

    // For each group, calculate hashes to confirm duplicates
    for (const [size, files] of potentialDuplicateGroups) {
      const hashGroups = new Map<string, FileInfo[]>()

      for (const file of files) {
        const hash = await calculateFileHash(file.bucket, file.key)
        
        if (hash) {
          if (!hashGroups.has(hash)) {
            hashGroups.set(hash, [])
          }
          hashGroups.get(hash)!.push(file)
        }
      }

      // Store actual duplicates (same hash, multiple files)
      for (const [hash, duplicateFilesList] of hashGroups.entries()) {
        if (duplicateFilesList.length > 1) {
          for (const file of duplicateFilesList) {
            const fileName = file.key.split('/').pop() || file.key
            const dbRef = await findDatabaseReference(fileName)

            await db.insert(duplicateFiles).values({
              fileHash: hash,
              fileName,
              bucketName: BUCKET_DISPLAY_NAMES[file.bucket] || file.bucket,
              objectKey: file.key,
              fileSize: file.size,
              lastModified: file.lastModified,
              dbReference: dbRef?.table || null,
              dbRecordId: dbRef?.id || null,
              uuid: dbRef?.uuid || null,
              scanDate: new Date(),
            })

            duplicatesFound++
          }
        }
      }
    }

    console.log(`Duplicate scan completed. Found ${duplicatesFound} duplicate files.`)

    return NextResponse.json({
      success: true,
      totalFiles: allFiles.length,
      duplicatesFound,
      potentialGroups: potentialDuplicateGroups.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Duplicate scan failed:', error)
    return NextResponse.json(
      { error: 'Failed to scan for duplicates' },
      { status: 500 }
    )
  }
}

// Allow manual triggering for testing
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const force = searchParams.get('force') === 'true'
  
  if (!force) {
    return NextResponse.json(
      { error: 'Use ?force=true to manually trigger duplicate scan' },
      { status: 400 }
    )
  }

  // For manual triggers, we'll still use the GET logic but without auth check
  return GET(request)
}