import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'

export async function generateStaticParams() {
    const result = await db.select({
        id: imageData.id,
        fileUrl: imageData.fileUrl,
    }).from(imageData)
    console.log(result)

    if (!Array.isArray(result)) {
        console.error('Result is not an array:', result)
        return
    }

    const imageMeta = result.reduce((map, item) => {
        map.set(item.id, item.fileUrl)
        return map
    }, new Map())
    
    console.log(imageMeta)

    return(
        <section>
            {imageMeta.get((id) => (
                <div>Id: {id}</div>
            ))}
        </section>
    )
}
