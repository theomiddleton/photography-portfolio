import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'

export async function GET(req: NextApiRequest, res: NextApiResponse, request: Request) {
    try{
        const result = await db.select({
          id: imageData.id,
          fileUrl: imageData.fileUrl,
        }).from(imageData);
        console.log("server side, ", result);
        const fileUrl = result[1].fileUrl //the array index is not currently synced to database id

        // Send the image URL as the response
        //res.status(200).json({ url: fileUrl });
        //return new Response('ok', {
        //  status: 200
        //})
        //return NextResponse.json({ url: fileUrl })
        return NextResponse.json({ result: result })
    } catch (error) {
        console.error('Error fetching image URL from the database:', error);
        res.status(500).send('Error fetching image URL from the database');
    }
}