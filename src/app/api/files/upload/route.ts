import { type NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2 } from '~/lib/r2'
import { getSession } from '~/lib/auth/auth'
import { uploadRateLimit, getClientIP } from '~/lib/rate-limit'
import { logAction } from '~/lib/logging'
import { getServerSiteConfig } from '~/config/site'

interface UploadRequestBody {
  filename: string
  contentType: string
  bucket: string
  prefix?: string
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = await uploadRateLimit.check(clientIP)
    
    if (!rateLimitResult.success) {
      await logAction('files-upload', `Rate limit exceeded for IP: ${clientIP}`)
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const session = await getSession()

    // If there's no session or the user is not an admin, return unauthorized
    if (!session?.role || session.role !== 'admin') {
      await logAction('files-upload', `Unauthorized upload attempt from IP: ${clientIP}`)
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 },
      )
    }

    const body = await request.json() as UploadRequestBody
    const { filename, contentType, bucket, prefix = '' } = body

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    if (!bucket) {
      return NextResponse.json({ error: 'Bucket is required' }, { status: 400 })
    }

    if (!contentType) {
      return NextResponse.json({ error: 'Content type is required' }, { status: 400 })
    }

    // Sanitize filename for security - remove dangerous characters
    const sanitizedFilename = filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255)

    // Generate the storage key (path in bucket)
    const key = prefix ? `${prefix}/${sanitizedFilename}` : sanitizedFilename

    await logAction('files-upload', `Generating pre-signed URL for ${sanitizedFilename} to ${bucket}/${key} by ${session.email}`)

    // Create PutObjectCommand with metadata
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      Metadata: {
        'uploaded-by': String(session.id),
        'upload-timestamp': new Date().toISOString(),
        'original-filename': filename,
      },
    })

    // Generate pre-signed URL valid for 60 seconds
    const url = await getSignedUrl(r2, command, { expiresIn: 60 })

    // Get site config to build file URL
    const siteConfig = getServerSiteConfig()
    const fileUrl = `${siteConfig.filesBucketUrl}/${key}`

    const response = {
      success: true,
      url,
      fileUrl,
      key,
      sanitizedFilename,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating pre-signed URL:', error)
    await logAction('files-upload', `Pre-signed URL generation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 },
    )
  }
}
