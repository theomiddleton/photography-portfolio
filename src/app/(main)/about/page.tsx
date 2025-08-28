import React from 'react'
import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import { about } from '~/server/db/schema'
import { notFound } from 'next/navigation'
import { TipTapRenderer } from '~/components/blog/tiptap-renderer'
import type { Metadata } from 'next'
import { siteConfig } from '~/config/site'
import { seoUtils } from '~/lib/seo-utils'

export const revalidate = 3600 // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  const result = await db
    .select({
      title: about.title,
      content: about.content,
    })
    .from(about)
    .where(eq(about.current, true))
    .limit(1)

  const aboutData = result[0]

  if (!aboutData) {
    return seoUtils.getAboutMetadata()
  }

  let contentText = ''
  try {
    const parsed = JSON.parse(aboutData.content) as { content?: unknown[] }
    // Extract first paragraph text if possible
    if (
      parsed &&
      Array.isArray(parsed.content) &&
      parsed.content.length > 0 &&
      typeof parsed.content[0] === 'object' &&
      parsed.content[0] !== null &&
      'content' in parsed.content[0]
    ) {
      const para = parsed.content[0] as { content?: { text?: string }[] }
      if (Array.isArray(para.content) && para.content.length > 0) {
        contentText = para.content
          .map((c) => (typeof c.text === 'string' ? c.text : ''))
          .join(' ')
          .trim()
          .substring(0, 155) // Limit for meta description
      }
    }
  } catch {
    contentText = ''
  }

  return seoUtils.getAboutMetadata(aboutData.title, contentText)
}

export default async function About() {
  const result = await db
    .select({
      id: about.id,
      content: about.content,
      title: about.title,
    })
    .from(about)
    .where(eq(about.current, true))
    .limit(1)

  // Assuming there is only one current about page, if not this will need to be changed.
  const aboutData = result[0]

  if (!aboutData) {
    notFound()
  }

  let content
  try {
    content = JSON.parse(aboutData.content)
  } catch (parseError) {
    console.error('[About] Error parsing about page content:', parseError)
    content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Error loading content.' }],
        },
      ],
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          {aboutData.title}
        </h1>
        <section className="flex min-h-screen flex-col items-center">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <TipTapRenderer content={content} />
          </div>
        </section>
      </div>
    </main>
  )
}