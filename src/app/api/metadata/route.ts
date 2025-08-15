import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '~/lib/auth/auth'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { waitUntil } from '@vercel/functions'
import { logAction } from '~/lib/logging'
import { AI_PROMPTS } from '~/config/ai-prompts'
import { isAIAvailable, getAIUnavailableReason } from '~/lib/ai-utils'

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

async function generateMetadataWithAI(imageUrl: string, tasks: string[]) {
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
  const filteredResponse: Partial<typeof result.object> = {}

  if (tasks.includes('title')) {
    filteredResponse.title = result.object.title
  }
  if (tasks.includes('description')) {
    filteredResponse.description = result.object.description
  }
  if (tasks.includes('tags')) {
    filteredResponse.tags = result.object.tags
  }

  return filteredResponse
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    // Check if AI features are available
    if (!isAIAvailable()) {
      return NextResponse.json(
        { error: getAIUnavailableReason() },
        { status: 400 },
      )
    }

    // Check authentication
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageUrl, tasks } = (await req.json()) as {
      imageUrl: string
      tasks: string[]
    }

    if (!imageUrl || !tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Missing required fields: imageUrl and tasks' },
        { status: 400 },
      )
    }

    // Use waitUntil for logging the request
    waitUntil(
      logAction(
        'ai-metadata',
        `Generating metadata for image: ${imageUrl}, tasks: ${tasks.join(', ')}`,
      ),
    )

    const result = await generateMetadataWithAI(imageUrl, tasks)

    // Use waitUntil for success logging and performance metrics
    const duration = Date.now() - startTime
    waitUntil(
      Promise.all([
        logAction(
          'ai-metadata',
          `Successfully generated metadata in ${duration}ms. Tasks: ${tasks.join(', ')}`,
        ),
        logAction(
          'ai-performance',
          `AI generation took ${duration}ms for ${tasks.length} tasks`,
        ),
      ]),
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Metadata generation error:', error)

    // Use waitUntil for error logging
    const duration = Date.now() - startTime
    waitUntil(
      logAction(
        'ai-metadata',
        `Failed to generate metadata after ${duration}ms. Error: ${error.message}`,
      ),
    )

    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 },
    )
  }
}
