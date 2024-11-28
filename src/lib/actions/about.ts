'use server'

import { z } from 'zod'

import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { about, aboutImages } from '~/server/db/schema'

const AboutSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  images: z.array(z.object({
    id: z.number(),
    name: z.string(),
    url: z.string()
  })).optional(),
})

export type AboutData = z.infer<typeof AboutSchema>

export async function readAbout(): Promise<AboutData | null> {
  const result = await db.select({
    id: about.id,
    title: about.title,
    content: about.content,
  })
  .from(about)
  .where(eq(about.current, true))
  .limit(1)

  if (result.length === 0) {
    return null
  }

  // Fetch associated images
  const images = await db.select({
    id: aboutImages.id,
    name: aboutImages.name,
    url: aboutImages.url,
  })
  .from(aboutImages)
  .where(eq(aboutImages.aboutId, result[0].id))

  return {
    ...result[0],
    images,
  }
}

export async function saveAbout(data: AboutData) {
  try {
    // parse and validate the incoming data
    const validatedData = AboutSchema.parse(data)
    
    console.log('Saving about:', validatedData)
    
    // Set all current entries to false
    await db.update(about)
      .set({ current: false })
      .where(eq(about.current, true))

    // Insert new about entry
    const [newAbout] = await db.insert(about).values({
      title: validatedData.title,
      content: validatedData.content,
      current: true,
    }).returning({ id: about.id })

    // Insert images
    if (validatedData.images && validatedData.images.length > 0) {
      await db.insert(aboutImages).values(
        validatedData.images.map(image => ({
          aboutId: newAbout.id,
          name: image.name,
          url: image.url,
        }))
      )
    }

    // give success message and return the id of the new about entry
    return { 
      success: true, 
      message: 'About published successfully',
      id: newAbout.id
    }
  } catch (error) {
    // if zod catches an error, return the validation errors
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        message: 'Validation failed', 
        errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      }
    }
    // else return a generic error message
    console.error('Error saving about:', error)
    
    return { 
      success: false, 
      message: 'An unexpected error occurred' 
    }
  }
}