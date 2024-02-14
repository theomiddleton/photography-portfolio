import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'

export async function GET(req: NextApiRequest, res: NextApiResponse, request: Request) {
  const { imageKey } = await request.json()
    try{
        // Fetch the image URL from the database
        const result = await db.select({
          field1: imageData.fileUrl,
        }).from(imageData).where({ uuid: imageKey }).getOne()

        const { fileUrl } = result[0];
        console.log('fileUrl', fileUrl);

        // Send the image URL as the response
        res.status(200).json({ url: fileUrl });
    } catch (error) {
        console.error('Error fetching image URL from the database:', error);
        res.status(500).send('Error fetching image URL from the database');
    }
}