import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { deleteImage } from '~/lib/actions/delete'
import { DeleteTable } from '~/components/delete/delete-table'
import { ImageReorder } from '~/components/image-reorder'

export default async function Delete() {
  const images = await db.select().from(imageData)
  console.log(images)

  return (
    <div className="min-h-screen container mx-auto bg-white text-black space-y-12 py-10">
      {/* <DeleteTable images={images} deleteImage={deleteImage} /> */}
      <DeleteTable />
      <ImageReorder images={images} />
    </div>
  )
}