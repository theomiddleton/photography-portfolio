import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { r2 } from '~/lib/r2'
import { siteConfig } from '~/config/site'

import { eq, sql } from 'drizzle-orm' 
import { db } from '~/server/db'
import { imageData, storeImages } from '~/server/db/schema'

import { NextResponse } from 'next/server'

import { getSession } from '~/lib/auth/auth'

export async function POST(request: Request) {
  
  const session = await getSession()
  
  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'User is not authenticated, or is not authorized.' }, { status: 401 })
  }
  
  // Get the file name, name, description, tags, and isSale status from the request
  const { filename, name, description, tags, isSale } = await request.json()
  console.log(filename, ',', name, ',', description, ',', tags, ',', isSale)

  try {
    // take the file extention from the filename
    const fileExtension = filename.split('.').pop()
    // create a unique key name for the image
    const keyName = uuidv4() 
    
    // create a new PutObjectCommand with the bucket name and key name
    const command = new PutObjectCommand({
      Bucket: process.env.R2_IMAGE_BUCKET_NAME,
      Key: keyName + '.' + fileExtension,
    }) 
    // get a signed URL for the PutObjectCommand
    const url = await getSignedUrl(r2, command, { expiresIn: 60 }) 
    //console.log('server side url', url)
    // get the new filename with the key name and file extension
    const newFileName = keyName + '.' + fileExtension
    // create the file URL with the bucket URL and new file name
    const fileUrl =`${siteConfig.bucketUrl}/${newFileName}`
    console.log(fileUrl)
    // insert the image data into the database
    await db.insert(imageData).values({
      uuid: keyName, 
      fileName: newFileName, 
      fileUrl: fileUrl,
      name: name,
      description: description,
      tags: tags,
    })

    console.log('isSale status ', isSale)
    
    // fetch that image data from the database
    const result = await db
      .select({
        id: imageData.id,
        fileUrl: imageData.fileUrl,
      })
      .from(imageData)
      .where(eq(imageData.uuid, sql.placeholder('uuid')))
      .execute({ uuid: keyName })
    
    // insert the store image data into the database
    await db.insert(storeImages).values({
      imageId: result[0].id,
      imageUuid: keyName, 
      fileUrl: fileUrl,
      price: 100,
      stock: 10,
      visible: isSale,
      //change to a componetnt within the image upload to set stock and price
    })

    // return the signedUrl to the client to upload the image
    return Response.json({ url })
  } catch (error) {
    // otherwise, return an error message
    console.error(error) 
    return Response.json({ error: error.message })
  }
}

export const runtime = 'edge'