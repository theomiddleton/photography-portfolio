import { type NextRequest, NextResponse } from 'next/server'
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
    const { oldKey, newKey, bucket } = await request.json()

    if (!oldKey || !newKey) {
      return NextResponse.json(
        { error: 'oldKey and newKey are required' },
        { status: 400 },
      )
    }

    if (!bucket) {
      return NextResponse.json({ error: 'Bucket is required' }, { status: 400 })
    }

    // Copy the object to the new location
    const copyCommand = new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${oldKey}`,
      Key: newKey,
    })

    await r2.send(copyCommand)

    // Delete the original object
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: oldKey,
    })

    await r2.send(deleteCommand)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error renaming file:', error)
    return NextResponse.json(
      { error: 'Failed to rename file' },
      { status: 500 },
    )
  }
}
