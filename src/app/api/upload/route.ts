import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { r2 } from '~/lib/r2'
import { siteConfig } from '~/config/site'

import { eq, sql } from 'drizzle-orm' 
import { db } from '~/server/db'
import { imageData, storeImages, blogImgData } from '~/server/db/schema'
import { NextResponse } from 'next/server'

import { getSession } from '~/lib/auth/auth'

export async function POST(request: Request) {
  
  const session = await getSession()
  
  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'User is not authenticated, or is not authorized.' }, { status: 401 })
  }
  
  const { filename, name, description, tags, isSale, bucket } = await request.json()
  console.log('Passed to API route:', filename, ',', name, ',', description, ',', tags, ',', isSale, ',', bucket)

  try {
    // take the file extention from the filename
    const fileExtension = filename.split('.').pop()
    // create a unique key name for the image
    const keyName = uuidv4() 
    
    // Determine which bucket to use based on the bucket prop
    const bucketName = bucket === 'image' 
      ? process.env.R2_IMAGE_BUCKET_NAME 
      : process.env.R2_BLOG_IMG_BUCKET_NAME

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: keyName + '.' + fileExtension,
    }) 

    const url = await getSignedUrl(r2, command, { expiresIn: 60 }) 

    const newFileName = keyName + '.' + fileExtension
    const fileUrl = `${bucket === 'image' ? siteConfig.imageBucketUrl : siteConfig.blogBucketUrl}/${newFileName}`
    
    console.log('fileUrl:', fileUrl)

    if (bucket === 'image') {
      await db.insert(imageData).values({
        uuid: keyName, 
        fileName: newFileName, 
        fileUrl: fileUrl,
        name: name,
        description: description,
        tags: tags,
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
      // await db.insert(blogImgData).values({
      //   uuid: keyName,
      //   fileName: newFileName,
      //   fileUrl: fileUrl,
      //   name: name,
      //   description: description,
      //   tags: tags,
      // })
    }

    return Response.json({ url, fileUrl })
  } catch (error) {
    console.error(error) 
    return Response.json({ error: error.message })
  }
}