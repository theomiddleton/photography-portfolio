import { db } from '~/server/db'
import { blogs, blogImages } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { useRemarkSync } from 'react-remark'

import { SiteHeader } from '~/components/site-header'

export default async function Blog({ params }: { params: { slug: string } }) {

	const slugAsNumber = Number(params.slug);

    const result = await db.select({
        id: blogs.id,
        title: blogs.title,
        content: blogs.content,
    }).from(blogs).where(eq(blogs.id, slugAsNumber))

    const posts = result.map((post) => ({
		slug: post.id,
    }))

	const images = await db.select({
		fileUrl: blogImages.fileUrl,
	}).from(blogImages).where(eq(blogImages.blogId, slugAsNumber))

	const mainContent = useRemarkSync(result[0].content)

	return (
		<main>
		<SiteHeader />
		<main className="flex min-h-screen flex-col items-center bg-white text-black">
		<div>
			<h1 className='text-2xl'>{result[0].title}</h1>
			<span></span>
			<p className='prose'>{mainContent}</p>
		</div>
		</main>
		</main>
	)
}