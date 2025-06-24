import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '~/lib/auth/auth'
import { env } from '~/env'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'

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

async function generateMetadataWithAI(
  imageUrl: string,
  prompt: string,
  tasks: string[],
) {
  const result = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    schema: MetadataSchema,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
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
  try {
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

    // Create the prompt based on requested tasks
    let prompt = `Analyze this image and provide the following information:\n`

    if (tasks.includes('title')) {
      prompt += `- A creative, descriptive title\n`
    }
    if (tasks.includes('description')) {
      prompt += `- A detailed description of what is shown in the image\n`
    }
    if (tasks.includes('tags')) {
      prompt += `- Relevant tags (comma-separated) that describe the content, style, and mood\n`
    }

    prompt += `\nFocus on being descriptive, engaging, and accurate. Consider the artistic elements, composition, lighting, mood, and subject matter.`

    const result = await generateMetadataWithAI(imageUrl, prompt, tasks)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Metadata generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 },
    )
  }
}
