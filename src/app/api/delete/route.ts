
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'

export async function POST(request: Request) {
    const { uuid, newFileName } = await request.json()

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_IMAGE_BUCKET_NAME,
      Key: newFileName,
    }) 

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

