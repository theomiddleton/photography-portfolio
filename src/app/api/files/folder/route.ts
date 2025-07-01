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
    const { bucket, folderPath } = await request.json()

    if (!folderPath) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 },
      )
    }

    if (!bucket) {
      return NextResponse.json({ error: 'Bucket is required' }, { status: 400 })
    }

    // Create an empty object with a trailing slash to represent a folder
    const key = folderPath.endsWith('/') ? folderPath : `${folderPath}/`

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: '',
    })

    await r2.send(command)

    return NextResponse.json({
      success: true,
      key,
      name: folderPath.split('/').filter(Boolean).pop() || folderPath,
    })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 },
    )
  }
}
