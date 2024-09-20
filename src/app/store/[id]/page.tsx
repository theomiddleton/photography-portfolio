import { eq } from 'drizzle-orm'
import { SiteHeader } from '~/components/site-header'
import { db } from '~/server/db'
import { imageData, storeImages } from '~/server/db/schema'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

// revalidate page content every 60 seconds
// ensures that the page is always up to date
export const revalidate = 60
export const dynamicParams = true

export default async function Photo({ params }: { params: { id: number } }) {
  // fetch the image data from the database
  // and join it with the storeImages table to get the price of the image 
  const result = await db.select({
    id: imageData.id,
    fileUrl: imageData.fileUrl,
    name: imageData.name,
    price: storeImages.price,
    description: imageData.description,
    uploadedAt: imageData.uploadedAt
  }).from(imageData).where(eq(imageData.id, params.id))
  .innerJoin(storeImages, eq(imageData.id, storeImages.imageId))

  // if the data corresponding to the id is not found
  // then return a 404 page
  if (result.length === 0) {
    notFound()
  }
  
  const image = result[0]

  return (
    <main>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div className="w-full aspect-[3/4] md:aspect-auto md:h-[70vh] lg:h-[80vh] xl:h-[90vh] relative max-h-[800px]">
            <Image 
              src={image.fileUrl} 
              alt="Product Image" 
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-3xl font-semibold">{image.name}</h1>
            <p className="text-xl text-muted-foreground">£{image.price}</p>
            <div className="space-y-2">
              {image.description}
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="frame" className="block text-sm font-medium mb-1">FRAME</label>
                <Select>
                  <SelectTrigger id="frame">
                    <SelectValue placeholder="Select Frame" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Frame</SelectItem>
                    <SelectItem value="wood">Wooden Frame</SelectItem>
                    <SelectItem value="metal">Metal Frame</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity</label>
                <Input
                  type="number"
                  id="quantity"
                  min="1"
                  placeholder="1"
                  className="w-20"
                />
              </div>
            </div>
            {/* <Button className="w-full md:w-auto px-8">Add To Cart</Button> */}
            <form action={`/store/checkout`} method="GET" className="w-full md:w-auto">
              <input type="hidden" name="id" value={params.id} />
              <Button type="submit" className="w-full md:w-auto px-8">
                Add To Cart
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}