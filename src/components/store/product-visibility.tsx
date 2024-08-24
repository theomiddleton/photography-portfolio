import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

import { db } from '~/server/db'
import { storeImages, imageData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export async function ProductVisibility({ id }: { id: number }) {

  const result = await db.select({
    visible : storeImages.visible,
    })
  .from(storeImages)
  .where(eq(storeImages.id, id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Visibility</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select>
              <SelectTrigger id="status" aria-label="Set visibility">
                <SelectValue placeholder={result[0].visible ? 'Visible' : 'Hidden'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="invisible">Invisible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
