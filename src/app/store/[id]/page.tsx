import { eq } from 'drizzle-orm'
import { SiteHeader } from '~/components/site-header'
import { db } from '~/server/db'
import { imageData, storeImages } from '~/server/db/schema'
import Image from 'next/image'

import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
// import { FacebookIcon, InstagramIcon, PinterestIcon, TwitterIcon } from "~/components/icons"

export default async function Photo({ params }: { params: { id: number } }) {

  const result = await db.select({
      id: imageData.id,
      fileUrl: imageData.fileUrl,
      name: imageData.name,
      price: storeImages.price,
      description: imageData.description,
      uploadedAt: imageData.uploadedAt
  }).from(imageData).where(eq(imageData.id, params.id))
  .innerJoin(storeImages, eq(imageData.id, storeImages.imageId))

  console.log(result)
  const imageUrl = result.map((item) => item.fileUrl) 
  console.log("fileUrl", imageUrl)

  return (
    <main>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 h-screen flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div className="w-full h-full flex items-center justify-center" style={{ maxHeight: '180vh' }}>
            <div className="relative w-full h-full">
              <Image 
                src={result[0].fileUrl} 
                alt="Product Image" 
                layout="fill" 
                objectFit="contain"
                className="w-full h-full"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-3xl font-semibold">{result[0].name}</h1>
            <p className="text-xl text-muted-foreground">£{result[0].price}</p>
            <div className="space-y-2">
              {result[0].description}
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
            <Button className="w-full md:w-auto px-8">Add To Cart</Button>
          </div>
        </div>
      </div>
    </main>
  )
}

export const runtime = 'edge'