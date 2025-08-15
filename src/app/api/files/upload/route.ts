import { type NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { getSession } from '~/lib/auth/auth'
import { extractExifData, validateExifData } from '~/lib/exif'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // If there's no session or the user is not an admin, return unauthorized
    if (!session?.role || session.role !== 'admin') {
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

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!bucket) {
      return NextResponse.json({ error: 'Bucket is required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const key = `${prefix}${file.name}`

    // Extract EXIF data if requested and file is an image
    let exifData = null
    if (extractExif && file.type.startsWith('image/')) {
      try {
        const rawExifData = await extractExifData(arrayBuffer)
        exifData = validateExifData(rawExifData)
        console.log(
          `Extracted EXIF data for ${file.name}:`,
          Object.keys(exifData),
        )
      } catch (error) {
        console.warn(`Failed to extract EXIF data from ${file.name}:`, error)
        // Don't fail the upload if EXIF extraction fails
      }
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })

    await r2.send(command)

    const response = {
      success: true,
      key,
      name: file.name,
      size: file.size,
      ...(exifData && { exifData }),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 },
    )
  }
}
