import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { blogs, blogImages } from '~/server/db/schema'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { r2 } from '~/lib/r2'
import { siteConfig } from '~/config/site'

export async function blogWrite(content: string, title: string) {
    // const { title, content, visible, tempId } = await request.json()
    const visible = true
    const tempId = uuidv4()

    if (tempId === undefined) {
        await db.insert(blogs).values({
            title: title,
            content: content,
            visible: visible,
        })
    } else {
        await db.update(blogs)
            .set({
                title: title,
                content: content,
                visible: visible,
                tempId: tempId,
            })
            .where(eq(blogs.tempId, tempId))
    }

    const blog = await db
        .select({
            id: blogs.id,
        })
        .from(blogs)
        .where(eq(blogs.title, sql.placeholder('title')))
        .execute({ title: title })

    //we need the blog to update, currently it is just creating a new row in the database every time
    //it needs to update the existing row, so we can fetch the id and pass it to the blogImages table

    return Response.json({ blog })
}

export async function blogFetch() {
    // needs modifing into fetching like blog. fetches all, passes only flagged content
    // fetch all, ask the user the id of what to edit, have a similar but new function to pass just that for editing 
    try {
        const result = await db.select({
            id: blogs.id,
            title: blogs.title,
            content: blogs.content,
        }).from(blogs)
        
        return result
    } catch (error) {
        return new Response('Error fetching image URL from the database', { status: 500 })
    }
}

export async function blogEditFetch(id: string) {
    try {
        const result = await db.select({
            id: blogs.id,
            title: blogs.title,
            content: blogs.content,
        }).from(blogs).where(eq(blogs.id, Number(id)))
        
        return result
    } catch (error) {
        return new Response('Error fetching image URL from the database', { status: 500 })
    }
}

export async function writeImgDb(request: Request) {
    const { filename, name, description, tags } = await request.json()

    try {
        const fileExtension = filename.split('.').pop()
        const keyName = uuidv4() 
        const command = new PutObjectCommand({
            Bucket: process.env.R2_IMAGE_BUCKET_NAME,
            Key: keyName + '.' + fileExtension,
        }) 
        const url = await getSignedUrl(r2, command, { expiresIn: 60 }) 
        console.log('server side url', url)
        const newFileName = keyName + '.' + fileExtension
        const fileUrl =`${siteConfig.bucketUrl}/${newFileName}`
        console.log('fileUrl', fileUrl)

        await db.insert(blogImages).values({
            imageId: keyName, 
            fileName: newFileName, 
            fileUrl: fileUrl,
            description: description,
        })

        const result = await db
            .select({
                fileUrl: blogImages.fileUrl,
            })
            .from(blogImages)
            .where(eq(blogImages.imageId, sql.placeholder('uuid')))
            .execute({ uuid: keyName }) 

        console.log('Inserted data:', result)
        return url
        // return Response.json({ url })
    } catch (error) {
        console.error(error) 
        return new Response('Error fetching image URL from the database', { status: 500 })
    }
}

export async function fetchBlogImg() {
    try {
        const result = await db.select({
            id: blogImages.id,
            fileUrl: blogImages.fileUrl,
            description: blogImages.description,
        }).from(blogImages)

        //console.log('Server side Fetched data:', result)
        
        return result
    } catch (error) {
        return new Response('Error fetching image URL from the database', { status: 500 })
    }
}

export const runtime = 'edge'