import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { r2 } from '~/lib/r2'

export async function POST(request: Request) {
  const { filename } = await request.json()

  try {
    const fileExtension = filename.split('.').pop();
    const keyName = uuidv4();

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: keyName + '.' + fileExtension,
    });
    const url = await getSignedUrl(r2, command, { expiresIn: 60 });

    return Response.json({ url })
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message })
  }
}