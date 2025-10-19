import { type NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2 } from '~/lib/r2'
import { getSession } from '~/lib/auth/auth'
import { uploadRateLimit, getClientIP } from '~/lib/rate-limit'
import { logAction } from '~/lib/logging'
import { isDangerousExtension, isDangerousMimeType } from '~/lib/file-security'
import { getServerSiteConfig } from '~/config/site'

interface UploadRequestBody {
  filename: string
  contentType: string
  bucket: string
  prefix?: string
  size?: number
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimitResult = await uploadRateLimit.check(clientIP)

    if (!rateLimitResult.success) {
      await logAction('files-upload', `Rate limit exceeded for IP: ${clientIP}`)
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 },
      )
    }

    const session = await getSession()

    if (!session?.role || session.role !== 'admin') {
      await logAction(
        'files-upload',
        `Unauthorized upload attempt from IP: ${clientIP}`,
      )
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 },
      )
    }

    const body = (await request.json()) as UploadRequestBody
    const { filename, contentType, bucket, prefix = '', size } = body
    const siteConfig = getServerSiteConfig()
    const allowDangerousFiles = Boolean(
      siteConfig.features?.security?.allowDangerousFiles,
    )

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 },
      )
    }

    if (!bucket) {
      return NextResponse.json({ error: 'Bucket is required' }, { status: 400 })
    }

    const normalizedBucket = bucket.toLowerCase()
    const allowedBuckets = new Set([
      'about',
      'blog',
      'img-custom',
      'img-public',
      'files',
      'stream',
    ])
    if (!allowedBuckets.has(normalizedBucket)) {
      await logAction(
        'files-upload',
        `Rejected upload to disallowed bucket: ${bucket} by ${session.email}`,
      )
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    if (!contentType) {
      return NextResponse.json(
        { error: 'Content type is required' },
        { status: 400 },
      )
    }

    const uploadLimits = siteConfig.uploadLimits as Record<string, number>
    const bucketLimitKeyMap: Record<string, string> = {
      'img-public': 'image',
      'img-custom': 'custom',
      stream: 'files',
    }
    const limitKey = bucketLimitKeyMap[normalizedBucket] ?? normalizedBucket
    const bucketLimitMB = uploadLimits[limitKey]
    if (typeof bucketLimitMB === 'number' && typeof size === 'number') {
      const bucketLimitBytes = bucketLimitMB * 1024 * 1024
      if (size > bucketLimitBytes) {
        const actualSizeMB = Math.round((size / (1024 * 1024)) * 100) / 100
        await logAction(
          'files-upload',
          `Rejected upload exceeding limit: ${filename} (${actualSizeMB}MB) > ${bucketLimitMB}MB for ${bucket} by ${session.email}`,
        )
        return NextResponse.json(
          {
            error: 'File too large',
            details: `File size ${actualSizeMB}MB exceeds limit of ${bucketLimitMB}MB for ${bucket}`,
          },
          { status: 413 },
        )
      }
    }

    const allowedContentTypes = new Set([
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'application/pdf',
      'text/plain',
      'text/markdown',
      'text/x-markdown',
      'application/zip',
      'application/x-zip-compressed',
    ])
    const normalizedContentType = contentType.toLowerCase()

    const sanitizedFilename =
      filename
        .split('/')
        .pop()
        ?.replace(/\.{2}/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/^\.+/, '')
        .replace(/_{2,}/g, '_')
        .substring(0, 255) || 'unnamed_file'

    const sanitizedPrefix = (prefix || '')
      .replace(/\.{2}/g, '')
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .filter(Boolean)
      .join('/')

    const userIdentifier = session.email ?? session.id ?? 'unknown user'
    const rejectInvalidFile = async (reason: string) => {
      await logAction(
        'files-upload',
        `Rejected upload ${sanitizedFilename}: ${reason} (${userIdentifier})`,
      )
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    }

    const hasExtension = sanitizedFilename.includes('.')
    const normalizedExtension = hasExtension
      ? sanitizedFilename
          .substring(sanitizedFilename.lastIndexOf('.'))
          .toLowerCase()
      : ''
    const dangerousExtension = isDangerousExtension(sanitizedFilename)
    const dangerousMime = isDangerousMimeType(contentType)

    if (!allowDangerousFiles && dangerousExtension) {
      return rejectInvalidFile(`dangerous extension ${normalizedExtension}`)
    }

    if (!allowDangerousFiles && dangerousMime) {
      return rejectInvalidFile(`dangerous MIME type ${normalizedContentType}`)
    }

    const extensionMimeMap: Record<string, string[]> = {
      '.jpg': ['image/jpeg', 'image/jpg'],
      '.jpeg': ['image/jpeg', 'image/jpg'],
      '.png': ['image/png'],
      '.webp': ['image/webp'],
      '.gif': ['image/gif'],
      '.mp4': ['video/mp4'],
      '.webm': ['video/webm'],
      '.mov': ['video/quicktime'],
      '.mp3': ['audio/mpeg'],
      '.wav': ['audio/wav'],
      '.m4a': ['audio/mp4'],
      '.pdf': ['application/pdf'],
      '.txt': ['text/plain'],
      '.md': ['text/markdown', 'text/x-markdown'],
      '.zip': ['application/zip', 'application/x-zip-compressed'],
    }

    const isOctetStream = normalizedContentType === 'application/octet-stream'

    if (isOctetStream) {
      if (!hasExtension) {
        return rejectInvalidFile('octet-stream without extension')
      }

      if (!allowDangerousFiles && dangerousExtension) {
        return rejectInvalidFile(
          `octet-stream with dangerous extension ${normalizedExtension}`,
        )
      }

      if (!extensionMimeMap[normalizedExtension]) {
        return rejectInvalidFile(
          `octet-stream with unsupported extension ${normalizedExtension || 'none'}`,
        )
      }
    }

    const expectedMimeTypes = extensionMimeMap[normalizedExtension]

    if (
      expectedMimeTypes &&
      normalizedContentType !== 'application/octet-stream' &&
      !expectedMimeTypes.includes(normalizedContentType)
    ) {
      return rejectInvalidFile(
        `content type ${normalizedContentType} does not match extension ${normalizedExtension}`,
      )
    }

    if (!isOctetStream && !allowedContentTypes.has(normalizedContentType)) {
      return rejectInvalidFile(
        `content type ${normalizedContentType} is not allowed`,
      )
    }

    const key = sanitizedPrefix
      ? `${sanitizedPrefix}/${sanitizedFilename}`
      : sanitizedFilename

    await logAction(
      'files-upload',
      `Generating pre-signed URL for ${sanitizedFilename} to ${bucket}/${key} by ${session.email}`,
    )

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    })

    const url = await getSignedUrl(r2, command, { expiresIn: 300 })

    const bucketKey = normalizedBucket
    const bucketUrlMap: Record<string, string | undefined> = {
      about: siteConfig.aboutBucketUrl,
      blog: siteConfig.blogBucketUrl,
      'img-custom': siteConfig.customBucketUrl,
      'img-public': siteConfig.imageBucketUrl,
      files: siteConfig.filesBucketUrl,
      stream: siteConfig.streamBucketUrl,
    }
    const baseUrl = bucketUrlMap[bucketKey] ?? siteConfig.filesBucketUrl ?? ''
    if (!baseUrl) {
      console.warn(`No URL configured for bucket: ${bucket}`)
    }
    const fileUrl = baseUrl ? `${baseUrl.replace(/\/+$/, '')}/${key}` : ''

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
    await logAction(
      'files-upload',
      `Pre-signed URL generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 },
    )
  }
}
