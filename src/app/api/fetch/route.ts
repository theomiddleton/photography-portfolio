import { NextApiRequest, NextApiResponse } from 'next' 
import { NextResponse } from 'next/server' 
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'

//export async function GET(res: NextApiResponse) {
export async function GET() {
    try{
        const result = await db.select({
          id: imageData.id,
          fileUrl: imageData.fileUrl,
        }).from(imageData) 
        
        return NextResponse.json({ result: result })
    } catch (error) {
        console.error('Error fetching image URL from the database:', error) 
        //res.status(500).send('Error fetching image URL from the database') 
    }
}