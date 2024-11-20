import Image from 'next/image'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { deleteImage } from '~/lib/actions/delete'
import { changeVisibility } from '~/lib/actions/visibility'
import { DeleteDialog } from '~/components/delete/delete-dialog'
import { VisibilityDialog } from '~/components/delete/visibility-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'

async function getImages() {
  return await db.select().from(imageData)
}

export async function DeleteTable() {
  const images = await getImages()
  const totalImages = images.length

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Image Management</CardTitle>
        <CardDescription>
          View, delete, and change visibility of images in your collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {images.map((image) => (
              <TableRow key={image.uuid}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={`Preview of ${image.fileName}`}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={image.fileUrl}
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">{image.name}</TableCell>
                <TableCell className="font-medium">{image.description}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <VisibilityDialog image={image} changeVisibility={changeVisibility} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <DeleteDialog image={image} deleteImage={deleteImage} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{totalImages}</strong> of <strong>{totalImages}</strong> images
        </div>
      </CardFooter>
    </Card>
  )
}