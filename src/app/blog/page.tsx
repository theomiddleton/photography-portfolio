import { db } from '~/server/db'
import { blogs, blogImages } from '~/server/db/schema'
import { Suspense } from 'react'

import { SiteHeader } from '~/components/site-header'

export default async function Blog() {

    const blogPosts = await db.select({
        id: blogs.id,
        title: blogs.title,
        content: blogs.content,
        visible: blogs.visible,
    }).from(blogs)

    const posts = blogPosts.map((post) => ({
        slug: post.id,
        title: post.title,
        visible: post.visible,
    }))

    const images = await db.select({
        id: blogImages.id,
        blogId: blogImages.blogId,
        fileUrl: blogImages.fileUrl,
        description: blogImages.description,
    }).from(blogImages)

    const postsWithImages = posts.map(post => {
        const image = images.find(image => image.blogId === post.slug);
        return {
            ...post,
            imageUrl: image ? image.fileUrl : null
        }
    })

    return (
        <main>
        <SiteHeader />
        <main className="flex min-h-screen flex-col items-center bg-white text-black">
            <div>
                <h1 className='text-2xl'></h1>
                <span></span>
                <section className="sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 max-h-5xl mx-auto space-y-4">
                    <Suspense fallback={<p>Loading Blog Posts...</p>}>
                        {postsWithImages.filter(post => post.visible).map((post) => (
                            <div key={post.slug} className="rounded-md overflow-hidden hover:scale-[0.97] duration-100">
                                <a href={'/blog/' + post.slug} target="_self" rel="noreferrer">
                                    {post.imageUrl && <img src={post.imageUrl} alt={post.title} />}
                                    <h3 className='mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0'>{post.title}</h3>
                                </a>
                            </div>
                        ))}
                    </Suspense>
                </section>
            </div>
        </main>
        </main>
    )
}