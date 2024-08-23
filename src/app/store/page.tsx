import { SiteHeader } from '~/components/site-header'
import Link from 'next/link'
import { db } from '~/server/db'
import { storeImages, imageData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default async function Store() {

	const results = await db.select({
		storeImageId: storeImages.id,
		fileUrl: imageData.fileUrl,
		imageName: imageData.name,
		price: storeImages.price
	}).from(storeImages)
		.innerJoin(imageData, eq(storeImages.imageId, imageData.id))

	const photos = results.map((result) => ({
		storeImageId: result.storeImageId,
		fileUrl: result.fileUrl,
		imageName: result.imageName,
		price: result.price
	}))

	return (
		<div className="flex flex-col">
			<SiteHeader />
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
					<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
						Print Store
					</h1>
				</div>
			<section className="w-full py-12 md:py-24 lg:py-32">
				<div className="container grid gap-8 px-4 md:grid-cols-2 lg:grid-cols-3 md:px-6">
					{photos.map((result) => (
						<div key={result.storeImageId} className="group relative overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl">
							<Link href={"store/" + result.storeImageId} className="absolute inset-0 z-10" prefetch={false}>
								<span className="sr-only">View Print</span>
							</Link>
							<img
								src={result.fileUrl}
								width={400}
								height={400}
								alt={result.imageName}
								className="aspect-square w-full object-cover transition-all group-hover:scale-105"
							/>
							<div className="p-4 bg-background">
								<h3 className="text-lg font-semibold">{result.imageName}</h3>
								<p className="text-muted-foreground">£{result.price}</p>
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	)
}