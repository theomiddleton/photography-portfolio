import { type NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { getSession } from '~/lib/auth/auth'
import { extractExifData, validateExifData } from '~/lib/exif'
import { uploadRateLimit, getClientIP } from '~/lib/rate-limit'
import { 
  validateFileUpload, 
  validateFileContent, 
  generateSecureStoragePath,
  createBucketValidationOptions,
  secureFileTypes 
} from '~/lib/file-security'
import { logAction } from '~/lib/logging'
import { getServerSiteConfig } from '~/config/site'

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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const prefix = (formData.get('prefix') as string) || ''
    const extractExif = formData.get('extractExif') === 'true'
    const allowAnyType = formData.get('allowAnyType') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!bucket) {
      return NextResponse.json({ error: 'Bucket is required' }, { status: 400 })
    }

    // Get bucket-specific validation options
    const bucketOptions = createBucketValidationOptions(bucket)
    
    // Get site config for dangerous file bypass feature
    const siteConfig = getServerSiteConfig()
    
    // Perform comprehensive file validation
    const validationResult = await validateFileUpload(file, {
      bucket,
      allowAnyType: allowAnyType || bucketOptions.allowAnyType,
      maxSize: bucketOptions.maxSize,
      customValidation: async (file: File) => {
        // Perform content validation for additional security
        const contentErrors = await validateFileContent(file)
        return contentErrors
      }
    }, siteConfig)

    if (!validationResult.isValid) {
      await logAction('files-upload', `File validation failed for ${file.name}: ${validationResult.errors.join(', ')}`)
      return NextResponse.json({ 
        error: 'File validation failed', 
        details: validationResult.errors,
        warnings: validationResult.warnings 
      }, { status: 400 })
    }

    // Log warnings if any
    if (validationResult.warnings.length > 0) {
      await logAction('files-upload', `File upload warnings for ${file.name}: ${validationResult.warnings.join(', ')}`)
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Generate storage path - for file browser uploads, use direct path
    const key = generateSecureStoragePath(
      validationResult.sanitizedName, 
      bucket, 
      String(session.id), 
      prefix,
      false // Don't use user structure for file browser uploads
    )

    // Extract EXIF data if requested and file is an image
    let exifData = null
    if (extractExif && validationResult.detectedType === 'image') {
      try {
        const rawExifData = await extractExifData(arrayBuffer)
        exifData = validateExifData(rawExifData)
        console.log(
          `Extracted EXIF data for ${validationResult.sanitizedName}:`,
          Object.keys(exifData),
        )
      } catch (error) {
        console.warn(`Failed to extract EXIF data from ${validationResult.sanitizedName}:`, error)
        // Don't fail the upload if EXIF extraction fails
      }
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // Add security metadata
      Metadata: {
        'uploaded-by': String(session.id),
        'upload-timestamp': new Date().toISOString(),
        'original-filename': file.name,
        'sanitized-filename': validationResult.sanitizedName,
        'detected-type': validationResult.detectedType || 'unknown',
        'file-hash': await generateFileHash(buffer),
      },
    })

    await r2.send(command)

    // Log successful upload
    await logAction('files-upload', `Successfully uploaded ${validationResult.sanitizedName} to ${bucket}/${key} by ${session.email}`)

    const response = {
      success: true,
      key,
      originalName: file.name,
      sanitizedName: validationResult.sanitizedName,
      size: file.size,
      detectedType: validationResult.detectedType,
      warnings: validationResult.warnings,
      ...(exifData && { exifData }),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error uploading file:', error)
    await logAction('files-upload', `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 },
    )
  }
}

/**
 * Generate a hash for file content to detect duplicates and for integrity checking
 */
async function generateFileHash(buffer: Buffer): Promise<string> {
  const crypto = await import('crypto')
  return crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 16)
}
