import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { blogs } from '~/server/db/schema'

export async function POST(request: Request) {
  const { title, content, visible, tempId } = await request.json()

  if (tempId === undefined) {
    await db.insert(blogs).values({
      title: title,
      content: content,
      visible: visible,
    })
  } else {
    await db.update(blogs)
      .set({
        title: title,
        content: content,
        visible: visible,
        tempId: tempId,
      })
      .where(eq(blogs.tempId, tempId))
  }

  const blog = await db
    .select({
      id: blogs.id,
    })
    .from(blogs)
    .where(eq(blogs.title, sql.placeholder('title')))
    .execute({ title: title })

  //we need the blog to update, currently it is just creating a new row in the database every time
  //it needs to update the existing row, so we can fetch the id and pass it to the blogImages table

  console.log('Inserted data:', blog)

  return Response.json({ blog })
}