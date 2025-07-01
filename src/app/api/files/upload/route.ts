import { type NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { getSession } from '~/lib/auth/auth'

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

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!bucket) {
      return NextResponse.json({ error: 'Bucket is required' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const key = `${prefix}${file.name}`

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })

    await r2.send(command)

    return NextResponse.json({
      success: true,
      key,
      name: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 },
    )
  }
}
