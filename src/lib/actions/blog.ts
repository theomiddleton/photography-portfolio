'use server'
import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { blogs, blogImages } from '~/server/db/schema'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { r2 } from '~/lib/r2'
import { siteConfig } from '~/config/site'

export async function blogWrite(content: string, title: string, visible: boolean) {

    await db.insert(blogs).values({
        title: title,
        content: content,
        visible: visible,
    })

    //we need the blog to update, currently it is just creating a new row in the database every time
    //it needs to update the existing row, so we can fetch the id and pass it to the blogImages table

    return new Response('Blog post created', { status: 200 })
}

export async function blogFetch() {
    try {
        const result = await db.select({
            id: blogs.id,
            title: blogs.title,
            content: blogs.content,
            visible: blogs.visible,
        }).from(blogs)
        
        return result
    } catch (error) {
        return new Response('Error fetching image URL from the database', { status: 500 })
    }
}

export async function blogEditFetch(id: number): Promise<{ id: number; title: string; content: string; visible: boolean }> {
    try {
        const result = await db.select({
            id: blogs.id,
            title: blogs.title,
            content: blogs.content,
            visible: blogs.visible,
        }).from(blogs).where(eq(blogs.id, Number(id)))
        
        if (result.length === 0) {
            throw new Error('Blog post not found')
        }
        return result[0]
    } catch (error) {
        throw new Error('Error fetching blog post from the database')
    }
}

export async function blogEditFetchDebug(id: number): Promise<{ id: number; title: string; content: string; visible: boolean }> {
    try {
        const result = await db.select({
            id: blogs.id,
            title: blogs.title,
            content: blogs.content,
            visible: blogs.visible,
        }).from(blogs).where(eq(blogs.id, Number(id)))
        
        if (result.length === 0) {
            throw new Error('Blog post not found')
        }
        return { ...result[0] }
    } catch (error) {
        throw new Error('Error fetching blog post from the database')
    }
}

export async function blogEdit(id: number, content: string, title: string, visible: boolean) {
    try {
        await db.update(blogs).set({
            title: title,
            content: content,
            visible: visible,
        }).where(eq(blogs.id, Number(id)))

        return new Response('Blog post updated', { status: 200 })
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
