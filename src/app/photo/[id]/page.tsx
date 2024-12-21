import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { notFound } from 'next/navigation'
import { AltImagePage } from '~/components/alt-image-page'

// Define a specific type for the selected data
type SelectedImageData = {
  id: number;
  fileUrl: string;
  name: string;
  description: string;
  tags: string;
  uploadedAt: Date;
};

// revalidate pages for new images every minute
// this ensures any recently uploaded images will be shown
export const revalidate = 60
export const dynamicParams = true

export default async function Photo({ params }: { params: { id: number } }) {
  // fetch image data from the database
  const result = await db
    .select({
      id: imageData.id,
      fileUrl: imageData.fileUrl,
      name: imageData.name,
      description: imageData.description,
      tags: imageData.tags,
      uploadedAt: imageData.uploadedAt,
    })
    .from(imageData)
    .where(eq(imageData.id, params.id))

  // if no image is found, return a 404
  if (result.length === 0) {
    notFound()
  }

  // shows different page based on the flag, altImagePage is a cleaner look, whereas ImagePage shows tags and title ect
  const image: SelectedImageData = result[0];
  return <AltImagePage data={image} />;
}