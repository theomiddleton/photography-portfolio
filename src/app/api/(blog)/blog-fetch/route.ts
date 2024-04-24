import { NextApiRequest, NextApiResponse } from 'next' 
import { db } from '~/server/db'
import { blogImages } from '~/server/db/schema'

const route = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const result = await db.select({
            id: blogImages.id,
            fileUrl: blogImages.fileUrl,
            description: blogImages.description,
        }).from(blogImages);

        console.log('Server side Fetched data:', result);
        
        res.status(200).json({ result });
    } catch (error) {
        console.error('Error fetching image URL from the database:', error);
        res.status(500).json({ error: 'Error fetching image URL from the database' });
    }
}

export default route