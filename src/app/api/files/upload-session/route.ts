import { type NextRequest, NextResponse } from 'next/server'
import {
  PutObjectCommand,
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  type CORSRule,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createHmac } from 'crypto'

import { r2 } from '~/lib/r2'
import { getSession } from '~/lib/auth/auth'
import { uploadRateLimit, getClientIP } from '~/lib/rate-limit'
import { logAction } from '~/lib/logging'
import { getServerSiteConfig } from '~/config/site'
import {
  createBucketValidationOptions,
  detectFileType,
  generateSecureStoragePath,
  isDangerousExtension,
  isDangerousMimeType,
  sanitizeFilename,
  secureFileTypes,
} from '~/lib/file-security'

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

type UploadSessionRequest = {
  bucket: string
  prefix?: string
  originalName: string
  fileSize: number
  contentType?: string
  allowAnyType?: boolean
}

const ensuredCorsOrigins = new Map<string, Set<string>>()
const ensuringBuckets = new Map<string, Promise<void>>()

const extractOrigin = (value: string | null | undefined) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.origin
  } catch {
    return null
  }
}

const ensureBucketCors = async (
  bucket: string,
  originCandidates: Array<string | null | undefined>,
) => {
  const requiredOrigins = new Set<string>()

  originCandidates.forEach((candidate) => {
    const origin = extractOrigin(candidate)
    if (origin) requiredOrigins.add(origin)
  })

  if (requiredOrigins.size === 0) return

  const alreadyEnsured = ensuredCorsOrigins.get(bucket)
  const missingOrigins = Array.from(requiredOrigins).filter((origin) =>
    alreadyEnsured ? !alreadyEnsured.has(origin) : true,
  )

  if (missingOrigins.length === 0) return

  if (ensuringBuckets.has(bucket)) {
    await ensuringBuckets.get(bucket)
    return ensureBucketCors(bucket, Array.from(requiredOrigins))
  }

  const ensurePromise = (async () => {
    let existingRules: CORSRule[] = []

    try {
      const response = await r2.send(
        new GetBucketCorsCommand({ Bucket: bucket }),
      )
      existingRules = response.CORSRules ?? []
    } catch (error) {
      const message = (error as { name?: string }).name
      if (message && message !== 'NoSuchCORSConfiguration') {
        console.warn(`Failed to fetch CORS rules for ${bucket}:`, error)
      }
    }

    const existingOrigins = new Set<string>()
    existingRules.forEach((rule) => {
      rule.AllowedOrigins?.forEach((origin) => {
        if (origin) existingOrigins.add(origin)
      })
    })

    let needsUpdate = false
    missingOrigins.forEach((origin) => {
      if (!existingOrigins.has(origin)) {
        existingOrigins.add(origin)
        needsUpdate = true
      }
    })

    if (!needsUpdate) {
      const ensured = ensuredCorsOrigins.get(bucket) ?? new Set<string>()
      requiredOrigins.forEach((origin) => ensured.add(origin))
      ensuredCorsOrigins.set(bucket, ensured)
      return
    }

    const mergedOrigins = Array.from(existingOrigins)
    const updatedRules: CORSRule[] = [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'OPTIONS'],
        AllowedOrigins: mergedOrigins,
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3000,
      },
    ]

    try {
      await r2.send(
        new PutBucketCorsCommand({
          Bucket: bucket,
          CORSConfiguration: { CORSRules: updatedRules },
        }),
      )
      const ensured = ensuredCorsOrigins.get(bucket) ?? new Set<string>()
      mergedOrigins.forEach((origin) => ensured.add(origin))
      ensuredCorsOrigins.set(bucket, ensured)
      console.info(
        `[files-upload] Updated CORS for ${bucket}: ${mergedOrigins.join(', ')}`,
      )
    } catch (error) {
      console.error(`Failed to update CORS rules for ${bucket}:`, error)
    }
  })()

  ensuringBuckets.set(bucket, ensurePromise)
  try {
    await ensurePromise
  } finally {
    ensuringBuckets.delete(bucket)
  }
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
      `Unauthorized upload attempt from IP: ${clientIP}`,
    )
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 },
    )
  }

  let body: UploadSessionRequest
  try {
    body = (await request.json()) as UploadSessionRequest
  } catch {
    return NextResponse.json(
      { error: 'Invalid request payload' },
      { status: 400 },
    )
  }

  const {
    bucket,
    prefix = '',
    originalName,
    fileSize,
    contentType,
    allowAnyType,
  } = body

  if (!bucket || !originalName || !Number.isFinite(fileSize)) {
    return NextResponse.json(
      { error: 'bucket, originalName, and fileSize are required' },
      { status: 400 },
    )
  }

  const siteConfig = getServerSiteConfig()

  await ensureBucketCors(bucket, [
    request.headers.get('origin'),
    siteConfig.url,
    siteConfig.altUrl,
    siteConfig.links?.website,
  ])

  const normalizedContentType = contentType || 'application/octet-stream'
  const sanitizedName = sanitizeFilename(originalName)

  if (!sanitizedName) {
    return NextResponse.json(
      { error: 'Filename could not be sanitized' },
      { status: 400 },
    )
  }

  const bucketOptions = createBucketValidationOptions(bucket)
  const uploadLimits = siteConfig.uploadLimits as Record<string, number>
  const configLimitMB = uploadLimits[bucket] ?? uploadLimits.files ?? 20
  const configLimitBytes = configLimitMB * 1024 * 1024
  const bucketOptionLimit = bucketOptions.maxSize ?? configLimitBytes
  const effectiveMaxBytes = Math.min(configLimitBytes, bucketOptionLimit)

  if (fileSize > effectiveMaxBytes) {
    const maxMB = (effectiveMaxBytes / (1024 * 1024)).toFixed(0)
    return NextResponse.json(
      {
        error: 'File too large',
        details: [`Maximum allowed size for bucket ${bucket} is ${maxMB}MB`],
      },
      { status: 400 },
    )
  }

  const allowUnsafeTypes = allowAnyType ?? bucketOptions.allowAnyType ?? false

  if (!allowUnsafeTypes) {
    if (isDangerousExtension(sanitizedName)) {
      return NextResponse.json(
        {
          error: 'File type is not allowed',
          details: [`Extension is blocked for security reasons`],
        },
        { status: 400 },
      )
    }
    if (normalizedContentType && isDangerousMimeType(normalizedContentType)) {
      return NextResponse.json(
        {
          error: 'MIME type is not allowed',
          details: [`MIME type ${normalizedContentType} is blocked`],
        },
        { status: 400 },
      )
    }
    const detectedType = detectFileType(sanitizedName, normalizedContentType)
    if (!detectedType) {
      const allowedTypes = Object.values(secureFileTypes)
        .map((type) => type.description)
        .join(', ')
      return NextResponse.json(
        {
          error: 'Unsupported file type',
          details: [`Allowed types: ${allowedTypes}`],
        },
        { status: 400 },
      )
    }
    const typeConfig = secureFileTypes[detectedType]
    if (!typeConfig.allowedBuckets.includes(bucket)) {
      return NextResponse.json(
        {
          error: 'Bucket not allowed',
          details: [
            `${typeConfig.description} files cannot be uploaded to ${bucket}`,
          ],
        },
        { status: 400 },
      )
    }
  }

  const storageKey = generateSecureStoragePath(
    sanitizedName,
    bucket,
    String(session.id),
    prefix,
    false,
  )

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storageKey,
    ContentType: normalizedContentType,
  })

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 600 })

  const payload = `${bucket}:${storageKey}:${sanitizedName}:${Number(allowUnsafeTypes)}:${prefix}:${fileSize}`
  const signature = createSignature(payload)

  await logAction(
    'files-upload',
    `Generated upload session for ${sanitizedName} (${fileSize} bytes) to ${bucket}/${storageKey} by ${session.email}`,
  )

  return NextResponse.json({
    uploadUrl,
    key: storageKey,
    sanitizedName,
    signature,
    headers: {
      'Content-Type': normalizedContentType,
    },
    limits: {
      maxBytes: effectiveMaxBytes,
      maxMB: configLimitMB,
    },
  })
}
