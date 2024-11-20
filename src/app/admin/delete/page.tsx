import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { deleteImage } from '~/lib/actions/delete'
import { DeleteTable } from '~/components/delete/delete-table'

export default async function Delete() {
  const images = await db.select().from(imageData)
  console.log(images)

  return (
    <div className='container mx-auto py-10'>
      <DeleteTable images={images} deleteImage={deleteImage} />
    </div>
  )
}