import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'

export async function fetchImages() {
    try{
        const result = await db.select({
            id: imageData.id,
            fileUrl: imageData.fileUrl,
        }).from(imageData) 
        
        return result
    } catch (error) {
        return new Response('Error fetching image URL from the database', { status: 500 })
    }
}