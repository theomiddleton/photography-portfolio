import { NextApiRequest, NextApiResponse } from 'next' 
import { NextResponse } from 'next/server' 
import { db } from '~/server/db'
import { blogImages } from '~/server/db/schema'

export async function GET(res: NextApiResponse) {
//export async function GET() {
    try{
        const result = await db.select({
            id: blogImages.id,
            fileUrl: blogImages.fileUrl,
            description: blogImages.description,
        }).from(blogImages)     
        return NextResponse.json({ result })
    } catch (error) {
        console.error('Error fetching image URL from the database:', error) 
    }
}