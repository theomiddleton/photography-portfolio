import { NextApiRequest, NextApiResponse } from 'next' 
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    try{
        const result = await db.select({
            id: imageData.id,
            fileUrl: imageData.fileUrl,
        }).from(imageData) 
        
        res.status(200).json({ result: result })
    } catch (error) {
        console.error('Error fetching image URL from the database:', error) 
        res.status(500).send('Error fetching image URL from the database') 
    }
}