import Image from 'next/image'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { deleteImage } from '~/lib/actions/delete'
import { DeleteDialog } from '~/components/delete/delete-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'

async function getImages() {
  return await db.select().from(imageData)
}

export async function DeleteTable() {
  const images = await getImages()

  return (
    <div className="container mx-auto py-10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden w-[100px] sm:table-cell">
              <span className="sr-only">Image</span>
            </TableHead>
            <TableHead className="hidden md:table-cell">File Name</TableHead>
            <TableHead className="hidden md:table-cell">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((image) => (
            <TableRow key={image.uuid}>
              <TableCell className="hidden sm:table-cell">
                <Image
                  alt="Product image"
                  className="aspect-square rounded-md object-cover"
                  height="64"
                  src={image.fileUrl}
                  width="64"
                />
              </TableCell>
              <TableCell>{image.fileName}</TableCell>
              <TableCell>
                <DeleteDialog image={image} deleteImage={deleteImage} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}