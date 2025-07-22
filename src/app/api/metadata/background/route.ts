import { NextResponse } from 'next/server'
import { getSession } from '~/lib/auth/auth'
import { logAction } from '~/lib/logging'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { waitUntil } from '@vercel/functions'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { AI_PROMPTS } from '~/config/ai-prompts'

export const runtime = 'edge'

const MetadataSchema = z.object({
  title: z.string().describe('A creative, descriptive title for the image'),
  description: z
    .string()
    .describe('A detailed description of what is shown in the image'),
  tags: z
    .string()
    .describe(
      'Comma-separated tags that describe the image content, style, and mood',
    ),
})

export async function POST(request: Request) {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }

  try {
    const {
      imageUrl,
      uuid,
      tasks,
      updateDatabase = true,
    } = await request.json()

    if (!imageUrl || !tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Missing required fields: imageUrl and tasks' },
        { status: 400 },
      )
    }

    // Use waitUntil for logging
    waitUntil(
      logAction(
        'ai-background',
        `Starting background AI generation for ${uuid || 'unknown'}`,
      ),
    )

    // Generate AI metadata immediately (this is the critical part)
    const result = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: MetadataSchema,
      messages: [
        {
          role: 'system',
          content: AI_PROMPTS.imageAnalysis.system,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: AI_PROMPTS.imageAnalysis.user(tasks) },
            { type: 'image', image: imageUrl },
          ],
        },
      ],
      temperature: 0.7,
    })

    // Filter response based on requested tasks
    const filteredResponse: any = {}
    if (tasks.includes('title') && result.object.title) {
      filteredResponse.title = result.object.title
    }
    if (tasks.includes('description') && result.object.description) {
      filteredResponse.description = result.object.description
    }
    if (tasks.includes('tags') && result.object.tags) {
      filteredResponse.tags = result.object.tags
    }

    // Use waitUntil for database updates and logging if requested
    if (updateDatabase && uuid && Object.keys(filteredResponse).length > 0) {
      waitUntil(
        Promise.all([
          // Update database with generated metadata
          db
            .update(imageData)
            .set({
              name: filteredResponse.title || undefined,
              description: filteredResponse.description || undefined,
              tags: filteredResponse.tags || undefined,
            })
            .where(eq(imageData.uuid, uuid)),
          // Log success
          logAction(
            'ai-background',
            `Successfully generated and saved AI metadata for ${uuid}`,
          ),
        ]),
      )
    } else {
      waitUntil(
        logAction(
          'ai-background',
          `Successfully generated AI metadata for ${uuid || 'request'} (no database update)`,
        ),
      )
    }

    return NextResponse.json(filteredResponse)
  } catch (error) {
    console.error('Background AI generation error:', error)

    // Use waitUntil for error logging
    waitUntil(
      logAction(
        'ai-background',
        `Failed to generate AI metadata: ${error.message}`,
      ),
    )

    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 },
    )
  }
}
