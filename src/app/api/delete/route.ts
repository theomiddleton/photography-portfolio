import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3" 
import { r2 } from '~/lib/r2'

import { eq, sql } from 'drizzle-orm' 
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'

export async function POST(request: Request) {
    const { uuid, newFileName } = await request.json()

    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: newFileName,
    }) 

    const result = await db
      .select({
        fileUrl: imageData.fileUrl,
      })
      .from(imageData)
      .where(eq(imageData.uuid, sql.placeholder('uuid')))
      .prepare()
      .execute({ uuid: uuid }) 

    try {
        const response = await r2.send(command) 
        console.log(response) 
        await db.delete(imageData).where(eq(imageData.uuid, uuid)) 
        return Response.json({ message: 'Deleted' }) 
    } catch (err) {
        console.error(err) 
        return Response.json({ error: err.message })
    }
}