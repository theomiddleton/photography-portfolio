import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { r2 } from '~/lib/r2'
import { siteConfig } from '~/config/site'

import { eq, sql } from 'drizzle-orm' 
import { db } from '~/server/db'
import { blogImages } from '~/server/db/schema'

export async function POST(request: Request) {
  const { filename, description } = await request.json()

  if (!filename) {
    console.error('Filename is required')
    throw new Error('Filename is required')
  }

  try {
    const fileExtension = filename.split('.').pop()
    const keyName = uuidv4()

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BLOG_IMAGE_BUCKET_NAME,
      Key: keyName + '.' + fileExtension,
    }) 
    const url = await getSignedUrl(r2, command, { expiresIn: 60 }) 
    console.log('server side url', url)
    const newFileName = keyName + '.' + fileExtension
    const fileUrl =`${siteConfig.blogImagesBucketUrl}/${newFileName}`
    console.log('fileUrl', fileUrl)

    await db.insert(blogImages).values({
      imageId: keyName, 
      fileName: newFileName, 
      fileUrl: fileUrl,
      description: description,
    })
    
    const result = await db
      .select({
        fileUrl: blogImages.fileUrl,
      })
      .from(blogImages)
      .where(eq(blogImages.imageId, sql.placeholder('uuid')))
      //.prepare()
      .execute({ uuid: keyName }) 
    console.log('Inserted data:', result)

    return Response.json({ url })
  } catch (error) {
    console.error(error) 
    return Response.json({ error: error.message })
  }
}
