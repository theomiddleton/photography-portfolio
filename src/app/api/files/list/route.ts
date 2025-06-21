import { NextRequest, NextResponse } from 'next/server'
import { ListObjectsV2Command, ListBucketsCommand } from '@aws-sdk/client-s3'
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
    const prefix = searchParams.get('prefix') || ''
    const bucket = searchParams.get('bucket') || ''

    // If no bucket is specified, list all buckets
    if (!bucket) {
      try {
        const command = new ListBucketsCommand({})
        const response = await r2.send(command)

        const buckets =
          response.Buckets?.map((bucket) => ({
            key: `${bucket.Name}/`,
            name: bucket.Name || '',
            size: 0,
            lastModified: bucket.CreationDate || new Date(),
            type: 'folder' as const,
            bucket: true,
          })) || []

        return NextResponse.json({ files: buckets })
      } catch (error) {
        // If ListBuckets fails due to permissions, fall back to a configured bucket list
        console.warn('ListBuckets failed, using fallback bucket list:', error)

        // Try to get buckets from environment variable
        const bucketNames = process.env.R2_BUCKET_NAMES?.split(',') || []

        if (bucketNames.length === 0) {
          return NextResponse.json(
            {
              error:
                'No buckets configured and ListBuckets permission denied. Please set R2_BUCKET_NAMES environment variable.',
            },
            { status: 500 },
          )
        }

        const buckets = bucketNames.map((name) => ({
          key: `${name.trim()}/`,
          name: name.trim(),
          size: 0,
          lastModified: new Date(),
          type: 'folder' as const,
          bucket: true,
        }))

        return NextResponse.json({ files: buckets })
      }
    }

    // List objects in the specified bucket
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: '/',
    })

    const response = await r2.send(command)

    const folders =
      response.CommonPrefixes?.map((prefix) => ({
        key: prefix.Prefix || '',
        name: (prefix.Prefix || '')
          .replace(
            prefix.Prefix?.slice(0, -1).lastIndexOf('/') !== -1
              ? prefix.Prefix.slice(
                  0,
                  prefix.Prefix.lastIndexOf('/', prefix.Prefix.length - 2) + 1,
                )
              : '',
            '',
          )
          .replace('/', ''),
        size: 0,
        lastModified: new Date(),
        type: 'folder' as const,
      })) || []

    const files =
      response.Contents?.filter((obj) => obj.Key !== prefix).map((obj) => {
        const fileName = obj.Key?.replace(prefix, '') || ''
        return {
          key: obj.Key || '',
          name: fileName,
          size: obj.Size || 0,
          lastModified: obj.LastModified || new Date(),
          type: 'file' as const,
          mimeType: getMimeType(fileName),
          thumbnail: isImage(fileName)
            ? `/api/files/thumbnail?bucket=${bucket}&key=${encodeURIComponent(obj.Key || '')}`
            : undefined,
        }
      }) || []

    const allItems = [...folders, ...files]

    return NextResponse.json({ files: allItems })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || ''
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    zip: 'application/zip',
    txt: 'text/plain',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

function isImage(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop() || ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
}
