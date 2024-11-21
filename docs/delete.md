# Delete

One of the original aims of the project was to have delete functionality.
This has not yet been fully implemented, but in an early commit I did create an API endpoint for deleting an image.
Since I never attached a UI to that endpoint, I decided to remove it from the project.

Obviously, the project still needed delete functionality, so I created that in the last few commits.

It started when adding a progress bar to the image upload form; This caused errors across admin client components.
After fixing those errors, I decided to finaly implement the delete functionality.

I chose to do it through a table in the admin client, where each row has a delete button, upon clicking the button, a confirmation dialog is shown.
This would then delete it from the database and the blob store, and update the table.
A simple server action handled the deletion

```ts
'use server'

import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { imageData, blogImgData, aboutImgData, storeImages, storeOrders } from '~/server/db/schema'
import { logAction } from '~/lib/logging'

// type definitions
interface DeleteImageParams {
  uuid: string
  fileName: string
  keepStoreData?: boolean
}

export async function deleteImage({ uuid, fileName, keepStoreData = false }: DeleteImageParams) {
  try {
    
    // delete from r2
    await r2.send(new DeleteObjectCommand({
      Bucket: process.env.R2_IMAGE_BUCKET_NAME,
      Key: fileName
    }))
    
    // delete image data from database
    await db.delete(imageData).where(eq(imageData.uuid, uuid))
    await db.delete(blogImgData).where(eq(blogImgData.uuid, uuid))
    await db.delete(aboutImgData).where(eq(aboutImgData.uuid, uuid))

    // delete store image data from database
    // if keepStoreData is false, delete store image data
    if (!keepStoreData) {
      const storeImage = await db.select().from(storeImages).where(eq(storeImages.imageUuid, uuid)).limit(1)
      
      if (storeImage.length > 0) {
        const storeImageId = storeImage[0].id
        await db.delete(storeOrders).where(eq(storeOrders.storeImageId, storeImageId))
        await db.delete(storeImages).where(eq(storeImages.id, storeImageId))
      }
    }

    // log it with custom logging implementation, storing the log in the db
    // return either success message or error message
    logAction('Delete', `Image ${uuid} deleted successfully`)
    return { success: true, message: 'Image deleted successfully' }
  } catch (error) {
    console.error('Error deleting image:', error)
    logAction('Delete', error)
    return { success: false, message: 'Failed to delete image' }
  }
}
```

This action is then called from the admin client when the delete button is clicked.
Within the table server component, the following code fetches the images from the db

```ts
async function getImages() {
  return await db.select().from(imageData)
}
```

The button to delete spawns a confirmation dialog through the following code

```tsx
<TableCell>
  <div className="flex space-x-2">
    <DeleteDialog image={image} deleteImage={deleteImage} />
  </div>
</TableCell>
```

It has to be done this way as the table mixes server and client components, and the dialog needs to be a client component.
The confimation dialog is the UI code and the handleDelete function

```tsx
  const handleDelete = () => {
    // using the transition react api so even if the delete takes a long time, the ui isnt blocked
    startTransition(async () => {
      try {
        // call the deleteImage server actio 
        const result = await deleteImage({
          uuid: image.uuid,
          fileName: image.fileName,
        })
        // set result / error message
        if (result.success) {
          setMessage({ type: 'success', text: `Image ${image.fileName} deleted successfully` })
        } else {
          setMessage({ type: 'error', text: `Failed to delete image ${image.fileName}: ${result.message}` })
        }
      } catch (error) {
        console.error('Error deleting image:', error)
        setMessage({ type: 'error', text: 'An unexpected error occurred while deleting the image' })
      }
      // close the dialog
      setIsOpen(false)
    })
  }
```

