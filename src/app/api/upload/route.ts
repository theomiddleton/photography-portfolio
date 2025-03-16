import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { r2 } from '~/lib/r2'
import { siteConfig } from '~/config/site'

import { eq, sql, max } from 'drizzle-orm'
import { db } from '~/server/db'
import {
  imageData,
  storeImages,
  blogImgData,
  aboutImgData,
  customImgData,
} from '~/server/db/schema'
import { NextResponse } from 'next/server'

import { logAction } from '~/lib/logging'
import { getSession } from '~/lib/auth/auth'

export async function POST(request: Request) {
  const session = await getSession()

  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }

  const { filename, name, description, tags, isSale, bucket } =
    await request.json()
  console.log(
    'Passed to API route:',
    filename,
    ',',
    name,
    ',',
    description,
    ',',
    tags,
    ',',
    isSale,
    ',',
    bucket,
  )
  logAction(
    'upload',
    `Uploading image: ${filename}, name: ${name}, description: ${description}, tags: ${tags}, isSale: ${isSale}, bucket: ${bucket}`,
  )

  try {
    // take the file extention from the filename
    const fileExtension = filename.split('.').pop()
    // create a unique key name for the image
    const keyName = uuidv4()

    // Determine which bucket to use based on the bucket prop
    const bucketName =
      bucket === 'image'
        ? process.env.R2_IMAGE_BUCKET_NAME
        : bucket === 'blog'
          ? process.env.R2_BLOG_IMG_BUCKET_NAME
          : bucket === 'about'
            ? process.env.R2_ABOUT_IMG_BUCKET_NAME
            : bucket === 'custom'
              ? process.env.R2_CUSTOM_IMG_BUCKET_NAME
              : null

    if (!bucketName) {
      throw new Error(`Invalid bucket type: ${bucket}`)
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: keyName + '.' + fileExtension,
    })

    const url = await getSignedUrl(r2, command, { expiresIn: 60 })

    const newFileName = keyName + '.' + fileExtension
    const fileUrl = `${
      bucket === 'image'
        ? siteConfig.imageBucketUrl
        : bucket === 'about'
          ? siteConfig.aboutBucketUrl
          : bucket === 'blog'
            ? siteConfig.blogBucketUrl
            : bucket === 'custom'
              ? siteConfig.customBucketUrl
              : ''
    }/${newFileName}`

    console.log('fileUrl:', fileUrl)

    if (bucket === 'image') {
      // Get the current maximum order
      const maxOrderResult = await db
        .select({
          maxOrder: sql<number>`COALESCE(MAX(${imageData.order}), 0)`,
        })
        .from(imageData)
        .execute()

      const newOrder = maxOrderResult[0].maxOrder + 1

      await db.insert(imageData).values({
        uuid: keyName,
        fileName: newFileName,
        fileUrl: fileUrl,
        name: name,
        description: description,
        tags: tags,
        order: newOrder,
      })

      const result = await db
        .select({
          id: imageData.id,
          fileUrl: imageData.fileUrl,
        })
        .from(imageData)
        .where(eq(imageData.uuid, sql.placeholder('uuid')))
        .execute({ uuid: keyName })

      if (isSale) {
        await db.insert(storeImages).values({
          imageId: result[0].id,
          imageUuid: keyName,
          fileUrl: fileUrl,
          price: 100,
          stock: 10,
          visible: true,
        })
      }
    } else if (bucket === 'blog') {
      console.log('Inserting blog image data')
      logAction('upload', 'Inserting blog image data')
      await db.insert(blogImgData).values({
        uuid: keyName,
        fileName: newFileName,
        fileUrl: fileUrl,
        name: name,
      })
    } else if (bucket === 'about') {
      console.log('Inserting about image data')
      logAction('upload', 'Inserting about image data')
      await db.insert(aboutImgData).values({
        uuid: keyName,
        fileName: newFileName,
        fileUrl: fileUrl,
        name: name,
      })
    } else if (bucket === 'custom') {
      console.log('Inserting custom image data')
      logAction('upload', 'Inserting custom image data')
      await db.insert(customImgData).values({
        uuid: keyName,
        fileName: newFileName,
        fileUrl: fileUrl,
        name: name,
      })
    }

    // Revalidate paths after successful upload
    if (bucket === 'image') {
      // Use fetch to call the revalidation API
      try {
        // Revalidate the homepage and photo pages
        const revalidateResponse = await fetch(
          `/api/revalidate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: '/',
            }),
          },
        )

        if (!revalidateResponse.ok) {
          console.error('Failed to revalidate paths')
        }
      } catch (revalidateError) {
        console.error('Error revalidating paths:', revalidateError)
      }
    }

    return Response.json({ url, fileUrl })
  } catch (error) {
    console.error(error)
    return Response.json({ error: error.message })
  }
}
