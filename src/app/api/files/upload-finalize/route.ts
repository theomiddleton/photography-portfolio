import { type NextRequest, NextResponse } from 'next/server'
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { createHmac } from 'crypto'

import { r2 } from '~/lib/r2'
import { getSession } from '~/lib/auth/auth'
import { uploadRateLimit, getClientIP } from '~/lib/rate-limit'
import { logAction } from '~/lib/logging'
import { getServerSiteConfig } from '~/config/site'
import {
  createBucketValidationOptions,
  validateFileUpload,
  validateFileContent,
} from '~/lib/file-security'
import { generateFileHash } from '~/lib/file-hash'
import { extractExifData, validateExifData } from '~/lib/exif'

export const runtime = 'nodejs'
export const maxDuration = 300

const SIGNING_SECRET =
  process.env.FILE_UPLOAD_SIGNING_SECRET || process.env.R2_SECRET_ACCESS_KEY

const createSignature = (payload: string) => {
  if (!SIGNING_SECRET)
    throw new Error(
      'Missing FILE_UPLOAD_SIGNING_SECRET or R2_SECRET_ACCESS_KEY for upload signing',
    )
  return createHmac('sha256', SIGNING_SECRET).update(payload).digest('hex')
}

type FinalizeRequest = {
  bucket: string
  key: string
  sanitizedName: string
  originalName: string
  fileSize: number
  contentType?: string
  allowAnyType?: boolean
  prefix?: string
  extractExif?: boolean
  signature: string
}

const streamToBuffer = async (body: any): Promise<Buffer> => {
  if (!body) return Buffer.alloc(0)
  if (body instanceof Buffer) return body
  if (body instanceof ArrayBuffer) return Buffer.from(body)

  const chunks: Buffer[] = []
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const rateLimitResult = await uploadRateLimit.check(clientIP)

  if (!rateLimitResult.success) {
    await logAction('files-upload', `Rate limit exceeded for IP: ${clientIP}`)
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const session = await getSession()

  if (!session?.role || session.role !== 'admin') {
    await logAction(
      'files-upload',
      `Unauthorized finalize attempt from IP: ${clientIP}`,
    )
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 },
    )
  }

  let body: FinalizeRequest
  try {
    body = (await request.json()) as FinalizeRequest
  } catch {
    return NextResponse.json(
      { error: 'Invalid request payload' },
      { status: 400 },
    )
  }

  const {
    bucket,
    key,
    sanitizedName,
    originalName,
    fileSize,
    contentType,
    allowAnyType,
    prefix = '',
    extractExif,
    signature,
  } = body

  if (!bucket || !key || !sanitizedName || !signature) {
    return NextResponse.json(
      { error: 'bucket, key, sanitizedName, and signature are required' },
      { status: 400 },
    )
  }

  const payload = `${bucket}:${key}:${sanitizedName}:${Number(allowAnyType ?? false)}:${prefix}:${fileSize}`
  const expectedSignature = createSignature(payload)

  if (signature !== expectedSignature) {
    await logAction(
      'files-upload',
      `Invalid upload signature for ${bucket}/${key}`,
    )
    return NextResponse.json(
      { error: 'Invalid upload signature' },
      { status: 403 },
    )
  }

  try {
    const head = await r2.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key }),
    )
    const remoteSize = Number(head.ContentLength ?? 0)

    if (remoteSize === 0) {
      await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
      return NextResponse.json(
        { error: 'Uploaded object is empty' },
        { status: 400 },
      )
    }

    if (fileSize && Math.abs(remoteSize - fileSize) > 1024) {
      await logAction(
        'files-upload',
        `File size mismatch for ${bucket}/${key}: expected ${fileSize}, got ${remoteSize}`,
      )
    }

    const bucketOptions = createBucketValidationOptions(bucket)
    const siteConfig = getServerSiteConfig()
    const uploadLimits = siteConfig.uploadLimits as Record<string, number>
    const configLimitMB = uploadLimits[bucket] ?? uploadLimits.files ?? 20
    const configLimitBytes = configLimitMB * 1024 * 1024
    const bucketOptionLimit = bucketOptions.maxSize ?? configLimitBytes
    const effectiveMaxBytes = Math.min(configLimitBytes, bucketOptionLimit)

    if (remoteSize > effectiveMaxBytes) {
      await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
      const maxMB = (effectiveMaxBytes / (1024 * 1024)).toFixed(0)
      return NextResponse.json(
        {
          error: 'File too large',
          details: [`Maximum allowed size for bucket ${bucket} is ${maxMB}MB`],
        },
        { status: 400 },
      )
    }

    const objectResponse = await r2.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    )
    const fileBuffer = await streamToBuffer(objectResponse.Body)
    const normalizedContentType =
      contentType || objectResponse.ContentType || 'application/octet-stream'
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength,
    ) as ArrayBuffer

    const nodeFile = new File([arrayBuffer], sanitizedName, {
      type: normalizedContentType,
      lastModified: Date.now(),
    })

    const validationResult = await validateFileUpload(
      nodeFile,
      {
        bucket,
        allowAnyType: allowAnyType ?? bucketOptions.allowAnyType,
        maxSize: bucketOptions.maxSize,
        customValidation: validateFileContent,
      },
      siteConfig,
    )

    if (!validationResult.isValid) {
      await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
      await logAction(
        'files-upload',
        `Validation failed for ${bucket}/${key}: ${validationResult.errors.join(', ')}`,
      )
      return NextResponse.json(
        {
          error: 'File validation failed',
          details: validationResult.errors,
          warnings: validationResult.warnings,
        },
        { status: 400 },
      )
    }

    const fileHash = await generateFileHash(fileBuffer)

    await r2.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: key,
        MetadataDirective: 'REPLACE',
        ContentType: normalizedContentType,
        Metadata: {
          'uploaded-by': String(session.id),
          'upload-timestamp': new Date().toISOString(),
          'original-filename': originalName,
          'sanitized-filename': validationResult.sanitizedName,
          'detected-type': validationResult.detectedType || 'unknown',
          'file-hash': fileHash,
        },
      }),
    )

    let exifData = null
    if (extractExif && validationResult.detectedType === 'image') {
      try {
        const rawExif = await extractExifData(arrayBuffer)
        exifData = validateExifData(rawExif)
        await logAction(
          'files-upload',
          `Extracted EXIF data for ${validationResult.sanitizedName}`,
        )
      } catch (error) {
        await logAction(
          'files-upload',
          `Failed to extract EXIF for ${validationResult.sanitizedName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }

    await logAction(
      'files-upload',
      `Completed upload for ${validationResult.sanitizedName} to ${bucket}/${key}`,
    )

    return NextResponse.json({
      success: true,
      key,
      sanitizedName: validationResult.sanitizedName,
      warnings: validationResult.warnings,
      detectedType: validationResult.detectedType,
      exifData,
    })
  } catch (error) {
    console.error('Error finalizing file upload:', error)
    await logAction(
      'files-upload',
      `Finalize error for ${bucket}/${key}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    return NextResponse.json(
      { error: 'Failed to finalize upload' },
      { status: 500 },
    )
  }
}
