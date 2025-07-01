'use server'

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '~/server/db'
import { about } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '~/lib/auth/auth'

const AboutSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  images: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).optional()
})

type AboutData = z.infer<typeof AboutSchema>

async function saveAbout(data: AboutData) {
  try {
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

    return { 
      success: true, 
      message: 'About published successfully',
      id: newAbout.id
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        message: 'Validation failed', 
        errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      }
    }
    
    console.error('Error saving about:', error)
    
    return { 
      success: false, 
      message: 'An unexpected error occurred' 
    }
  }
}

export async function POST(request: NextRequest) {
  try {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

    // Parse request body
    const body = await request.json()
    
    // Save about data
    const result = await saveAbout(body)
    
    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 200 })
    
  } catch (error) {
    console.error('API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get current about entry
    const currentAbout = await db.select()
      .from(about)
      .where(eq(about.current, true))
      .limit(1)

    if (!currentAbout || currentAbout.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No about content found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...currentAbout[0],
      }
    })
    
  } catch (error) {
    console.error('API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
