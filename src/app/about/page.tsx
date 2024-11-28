import React from 'react' 
import ReactMarkdown from 'react-markdown'
import { SiteHeader } from '~/components/site-header' 
import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import { about } from '~/server/db/schema'

import { readAbout } from '~/lib/actions/about'

export default async function About() {

  const result = await readAbout()  
  // const result = await db.select({
  //   id: about.id,
  //   content: about.content,
  //   image: about.imageBool
  // }).from(about).where(eq(about.current, true)) 

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <SiteHeader />
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          {result.title}
        </h1> 
        <section className="flex min-h-screen flex-col items-center bg-white text-black">
          {/* classname 'prose' ensures that the markdown is rendered properly, removing identifiers such as # and rendering headings and such */}
          <div className="prose max-w-none overflow-auto">
            <ReactMarkdown>{result.content}</ReactMarkdown>
          </div>
        </section>
      </div>
    </main>
  ) 
}
