import { NextApiRequest, NextApiResponse } from 'next' 
import { NextResponse } from 'next/server' 
import { db } from '~/server/db'
import { blogs } from '~/server/db/schema'

//export async function GET(req: NextRequest, res: NextApiResponse) {
export async function GET() {
    try {
        const result = await db.select({
            id: blogs.id,
            title: blogs.title,
            content: blogs.content,
        }).from(blogs)
        
        return NextResponse.json({ result })
    } catch (error) {
        console.error('Error fetching image URL from the database:', error)
        //res.status(500).json({ error: 'Error fetching image URL from the database' })
    }
}

export const runtime = 'edge'