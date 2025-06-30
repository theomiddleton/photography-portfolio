import { type NextRequest, NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { getSession } from '~/lib/auth/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    // If there's no session or the user is not an admin, return unauthorized
    if (!session?.role || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 },
      )
    }
    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get('bucket')
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    if (!bucket) {
      return NextResponse.json({ error: 'Bucket is required' }, { status: 400 })
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    const response = await r2.send(command)

    if (!response.Body) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const buffer = Buffer.from(await response.Body.transformToByteArray())

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving thumbnail:', error)
    return NextResponse.json(
      { error: 'Failed to serve thumbnail' },
      { status: 500 },
    )
  }
}
