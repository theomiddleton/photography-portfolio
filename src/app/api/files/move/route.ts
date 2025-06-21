import { NextRequest, NextResponse } from 'next/server'
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
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
    const { keys, destination, bucket } = await request.json()

    if (!keys || !destination) {
      return NextResponse.json(
        { error: 'Keys and destination are required' },
        { status: 400 },
      )
    }

    if (!bucket) {
      return NextResponse.json({ error: 'Bucket is required' }, { status: 400 })
    }

    for (const key of keys) {
      const fileName = key.split('/').pop()
      const newKey = `${destination}${fileName}`

      // Copy the object to the new location
      const copyCommand = new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: newKey,
      })

      await r2.send(copyCommand)

      // Delete the original object
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })

      await r2.send(deleteCommand)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error moving files:', error)
    return NextResponse.json({ error: 'Failed to move files' }, { status: 500 })
  }
}
