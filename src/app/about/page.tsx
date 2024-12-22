import React from 'react' 
import ReactMarkdown from 'react-markdown'
import { SiteHeader } from '~/components/site-header'
import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import { about } from '~/server/db/schema'
import { notFound } from 'next/navigation'

export const revalidate = 60 // Revalidate every 60 seconds

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <SiteHeader />
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          {aboutData.title}
        </h1>
        <section className="flex min-h-screen flex-col items-center bg-white text-black">
          <div className="prose max-w-none overflow-auto">
            <ReactMarkdown>{aboutData.content}</ReactMarkdown>
          </div>
        </section>
      </div>
    </main>
  )
}