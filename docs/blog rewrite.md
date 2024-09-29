# Blog rewrite

Other than the main page and image uploading, the blog was one of the first things I did, and the quality of the code reflects that.

## Starting the rewrite

The first thing I did was to completely remove the old blog code, other than the database schema.
Firstly I rewrote the `/admin/blog` page. This is the page that you create a new blog post on, and in the original version, also edit.
Since I wanted cleaner code, I opted to not have the edit in the same page, as the tabs makes the code much larger and messier.
Not needing tabs meant the ui went from 157 to 44 lines. At this point, the code was mainly just the ui, saving and publishing was not yet implemented.
I also changed the markdown library from `react-remark` to `react-markdown` as it seemed to be updated more often and a little simpler.

I then worked on the server side code. Rather than using API routes like the original, I opted to use server actions.
I had migrated the blog logic to server actions, however the implementation was messy and not very good.
One thing I wanted to use more of was better type safety. The previous version had a lot of `any` types, none promised returns, and no validation.
Similar to the rewrite of the signin pages in the auth rewrite, I wanted to use more types and validation.
Zod was used for validation, and I created a `PostSchema` for the validation of blog posts.
For the first development commit, the code only took the post data, parsed it, and logged it to the console.

In the next dev commit, I added alerts for when the post was saved or published.
On the server action, I added the logic to validate the post data, using the zod `PostSchema` I created in the previous commit.

### Moving 

From this point, I had created the new blog post page on the `/admin/blog` route. Since I wanted to be able to edit posts, this would not work.
I moved the page to `/admin/blog/newpost`.
At the `/admin/blog` route, I created a table that showed all the blog posts, and allowed the user to delete them.
Like all other tables, I used the shadcn table component, and had it in a separate component, `~/components/blog/blog-table.tsx`.
This meant that I could later add more components to the blog page, and not have a massive file.

## Editing posts

The edit page would be very similar to the new post page, but with the post data prefilled.
I created a new page, `/admin/blog/[id]`, where `[id]` is the id of the post.
I created a new server action, `loadDraft`, that would take the id of the post, and return the post data.

The newpost page is:
  
```tsx

'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

import { savePost } from '~/lib/actions/blog'

interface FeedbackState {
  type: 'success' | 'error' | null
  message: string
}

export default function BlogAdmin() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' })

  const handleSave = async (isDraft: boolean) => {
    setIsLoading(true)
    setFeedback({ type: null, message: '' })
    try {
      const result = await savePost({ title, content, isDraft })
      if (result.success) {
        setFeedback({ type: 'success', message: result.message })
      } else {
        setFeedback({ type: 'error', message: result.message })
      }
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'An error occurred. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Blog Editor
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Post Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content in Markdown"
              className="mt-1 h-[calc(100vh-400px)]"
              aria-label="Post content"
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Post Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title"
              className="mt-1"
              aria-label="Post title"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => handleSave(true)} variant="outline" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={() => handleSave(false)} disabled={isLoading} className="flex-1">
              {isLoading ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
          {feedback.type && (
            <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'}>
              <AlertTitle>{feedback.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="border rounded-lg p-4 prose prose-sm max-w-none h-[calc(100vh-100px)] overflow-auto">
          <h1>{title}</h1>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
```

And the edit post is 

```tsx  
'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { notFound } from 'next/navigation'

import { loadDraft, savePost } from '~/lib/actions/blog'
import type { PostData } from '~/lib/actions/blog'

interface FeedbackState {
  type: 'success' | 'error' | null
  message: string
}

export default function DraftEditor({ params }: { params: { id: string } }) {
  const draftId = parseInt(params.id, 10)
  
  const [draft, setDraft] = useState<PostData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' })

  if (isNaN(draftId)) {
    notFound()
  }

  useEffect(() => {
    const fetchDraft = async () => {
      const loadedDraft = await loadDraft(draftId)
      if (loadedDraft) {
        setDraft(loadedDraft)
      } else {
        setFeedback({ type: 'error', message: 'Failed to load draft' })
      }
      setIsLoading(false)
    }
    fetchDraft()
  }, [draftId])

  const handleSave = async (publish: boolean) => {
    if (!draft) return

    setIsSaving(true)
    setFeedback({ type: null, message: '' })
    try {
      const result = await savePost({ ...draft, isDraft: !publish })
      if (result.success) {
        setFeedback({ type: 'success', message: result.message })
        if (!publish) {
          setDraft({ ...draft, isDraft: true })
        }
      } else {
        setFeedback({ type: 'error', message: result.message })
      }
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading draft...</div>
  }

  if (!draft) {
    return <div className="h-screen flex items-center justify-center">Draft not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Draft</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Post Title
            </label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Enter your post title"
              className="mt-1"
              aria-label="Post title"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Post Content
            </label>
            <Textarea
              id="content"
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="Write your post content in Markdown"
              className="mt-1 h-[calc(100vh-400px)]"
              aria-label="Post content"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => handleSave(false)} disabled={isSaving} className="flex-1">
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={() => handleSave(true)} variant="outline" disabled={isSaving} className="flex-1">
              {isSaving ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
          {feedback.type && (
            <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'}>
              <AlertTitle>{feedback.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="border rounded-lg p-4 prose prose-sm max-w-none h-[calc(100vh-100px)] overflow-auto">
          <h1>{draft.title}</h1>
          <ReactMarkdown>{draft.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
```

## Blog table

Since I opted to not have the edit in the same page, I needed a way to edit the blog posts.
This would first require a way to view all the blog posts, and then a way to edit them.

The table showed the title, content, date, status, and actions.
Since it had to fit in a row, the title and content were truncated to maxLength, an integer prop that would truncate the string to that length.
the function was 

```ts
function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
```

and called like this:

```tsx
<TableCell>{truncateText(post.title, 30)}</TableCell>
<TableCell>{truncateText(post.content, 50)}</TableCell>
``` 

By using maxLength, it allowed the title and content to be truncated to different lengths, and not have to be the same length.

status was a boolean, and was displayed as a string, either 'Draft' or 'Published' with the following code:

```tsx
<TableCell>
  <Badge variant={post.draft ? 'secondary' : 'outline'}>
    {post.draft ? 'Draft' : 'Published'}
  </Badge>
</TableCell>
```

It changes the styling of the badge, and the string displayed based on the value of `post.draft`.

for the server action, I also addded placeholder loadDraft logic and deletePost logic.

```ts
export async function loadDraft(id: number): Promise<PostData | null> {
  return {
    id,
    title: 'Title',
    content: 'Sample content \n\n newline\n # Heading',
    isDraft: true
  }
}
export async function deletePost(id: number) {
  console.log('Deleting post:', id)
  return { success: true, message: 'Post deleted successfully' }
}
```

Since it was just development, I simply returned a placeholder markdown string for the draft, and logged the id of the post to delete.
I also changed the types, adding an `id` field to the `PostData` type but making it optional, as it would not be present in the draft.
I changed it from type inference from the zod schema to explicitly defining the type as `Post`.
I also exported this type, specifically an interface, so that it could be used in other files.

```ts
export type PostData = z.infer<typeof PostSchema>

export interface Post {
  id: number
  title: string
  content: string
  isDraft: boolean
}
```

This meant PostData was inferred from the PostSchema, and Post was explicitly defined as an interface with the fields `id`, `title`, `content`, and `isDraft`.

The table had an actions section. This was a dropdown that had the options to edit or delete the post.
This was the final cell in the row, and was created with the following code:

```tsx
<TableCell>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button aria-haspopup="true" size="icon" variant="ghost">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Toggle menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem asChild>
        <a href={`/admin/blog/edit/${post.id}`}>
          Edit
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setPostToDelete(post)}>
        Delete post
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>
```

### Errors 

On each row, theres an actions section, alowing the user to delete a post, or edit the post, linking to the edit page.
In writing this, I came accross the type error:

`ts: This comparison appears to be unintentional because the types 'number' and 'Post' have no overlap.`

```ts
const handleDeletePost = async (postId: number) => {
  await deletePost(postId)
  setPosts(prevPosts => prevPosts.filter(post => post.id !== post))
  setPostToDelete(null)
}
```
The error was on this part specificaly:
`post.id !== post`
The issue was I was comparing post.id (which is a number) with post (which is the entire Post object).
This is caused the type error because its trying to compare a number with an object of type Post.
To fix this, I needed to compare post.id with postId

```ts
const handleDeletePost = async (postId: number) => {
  await deletePost(postId)
  setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
  setPostToDelete(null)
}
```

Errors in the table. 
The table was showing the posts, but in the draft column, it was showing the wrong status.
The status was supposed to be 'Draft' if the post was a draft, and 'Published' if it was not.
However, it was showing 'Published' for all posts.
This was because I was checking `post.draft` instead of `post.isDraft` in the table.
I changed the code to check `post.isDraft` instead of `post.draft` and it worked as expected.

```tsx
<TableCell>
  <Badge variant={post.isDraft ? 'secondary' : 'outline'}>
    {post.isDraft ? 'Draft' : 'Published'}
  </Badge>
</TableCell>
```

The type interface at the top of the table component had to be changed as following 
  
```ts
  interface Post {
    id: number
    title: string
    content: string
  - draft: boolean
  + isDraft: boolean
    createdAt: Date
  }
```

### Loading data from the server

From this point, the blog table had been using placeholder data simply defined in the component.
This was useful for creating the table, but I needed to load the data from the server.
I created a new server action, `getPosts`, that would load all the posts from the server.
This was a simple function that returned an array of posts.

```ts
export async function getPosts(): Promise<Post[]> {
  return [
    { id: 1, title: 'Post 1', content: 'Content 1', isDraft: false, createdAt: new Date() },
    { id: 2, title: 'Post 2', content: 'Content 2', isDraft: false, createdAt: new Date() },
    { id: 3, title: 'Post 3', content: 'Content 3', isDraft: true, createdAt: new Date() },
  ]
}
``` 

It still returned placeholder data, but from the server, so when I could, it was easy to replace the data with the actual data from the server.

I also added the createdAt field to the Post interface. 

In the table, the post was fetchde from the server when the component was mounted, this was done with the useEffect hook.

```tsx
useEffect(() => {
  fetchPosts()
}, [])

const fetchPosts = async () => {
  const fetchedPosts = await getPosts()
  setPosts(fetchedPosts)
}
```

This would fetch the posts from the server when the component was mounted, and set the posts in the state, ensuring the table was populated with the data from the server.


### Linking the row to its edit page

The table had a link to the edit page for each post, but it was within the actions dropdown, meaning it was not immediately available.
I wanted to make the entire row clickable, so that clicking anywhere on the row would take the user to the edit page for that post.

by wrapping the row in a link, I could make the entire row clickable.

```tsx  
<TableRow 
  key={post.id}
  className="group cursor-pointer hover:bg-muted/50 transition-colors"
>
  <Link
    href={`/admin/blog/draft/${post.id}`}
    className="contents"
    aria-label={`Edit ${post.title}`}
  >
    <TableCell className="font-medium">{post.id}</TableCell>
    <TableCell>{truncateText(post.title, 30)}</TableCell>
    <TableCell>{truncateText(post.content, 50)}</TableCell>
    <TableCell>
      <Badge variant={post.isDraft ? 'secondary' : 'outline'}>
        {post.isDraft ? 'Draft' : 'Published'}
      </Badge>
    </TableCell>
    <TableCell className="hidden md:table-cell">
      {new Date(post.createdAt).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </TableCell>
  </Link>
``` 

This had to exclude the actions dropdown, as clicking on the dropdown would open the dropdown, and not take the user to the edit page.
The link was added to the row, and the row was styled to show the cursor as a pointer when hovered over, to indicate that it was clickable.
It would aslo show a different background color when hovered over, to indicate that it was clickable.

This however caused an issue, as the three dots showing the actions dropdown was now hidden, until the user hovered over the row.
I decided that I would rather had the three dots always visible, so I removed the link from the row, and may revisit this later.

### Moving types 

Since the Post type was used in multiple files, rather than defining it in all files, I moved it to a shared types file, so that it could be imported in both places.

```ts
export interface Post {
  id: number
  title: string
  content: string
  isDraft: boolean
  createdAt: Date
}
```

And imported as:
  
```ts
import type { Post } from '~/lib/types/Post'
```

## Creating a public blog page

The blog posts were only visible in the admin section, and I wanted to create a public blog page where the posts could be viewed by anyone.
I created a new page, `/app/blog/page.tsx`, that would show all the posts in card format, with a title, content, and a link to the full post.

```tsx
@@ -0,0 +1,65 @@
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'

import { db } from '~/server/db'
import { blogs } from '~/server/db/schema'

interface Post {
  id: number
  title: string
  content: string
  createdAt: Date
}

export default async function Blog() {
  const posts: Post[] = await db.select().from(blogs)
  
  if (posts.length <= 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Latest Blog Posts</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <p>No posts found.</p>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Latest Blog Posts</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">
                  <Link href={`/blog/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {formatDate(post.createdAt)}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
    </div>
  )
}
```

This page would fetch the posts from the server, and display them in card format, with the title, content, and the date the post was created.

There was however a flaw. Since the fetching was done as such `const posts: Post[] = await db.select().from(blogs)` All posts would be fetched and mapped to the Post type, which was not ideal, as the posts would be fetched even if they were drafts.
Since I would only want to show published posts, I would have to filter the posts before mapping them to the Post type.

```tsx
const allPosts: Post[] = await db.select().from(blogs)

// Filter out draft posts
const publishedPosts = allPosts.filter(post => !post.isDraft)

if (publishedPosts.length <= 0) {
  return (
    ...
    {publishedPosts.map((post) => (
      ...
    ))}
```

This would filter out the draft posts, and only show the published posts on the public blog page.

I also added the server action to fetch from the database, and return the posts.

```ts
export async function getPosts(): Promise<Post[]> {
  const posts: Post[] = await db.select().from(blogs)
  return posts
}
```

After updating the schema and pushing the changes, I was able to see the blog posts on the public blog page, meaning the blog writing feature was now complete.

# Blog Images

An original goal of the blog feature was to allow users to upload images to their blog posts.
Before the rewrite, the functionality for this was absolutely spaghetti code, needing around 4 API routes to handle the blog section. 

I decided that for the rewrite of this functionality, I didn't want to create any new upload components or api routes, and instead wanted to use the existing image upload functionality that was already in place.
This meant that I would have to use the existing image upload component, and the existing image upload API route.

The problem with this was that the image upload component was designed to upload images to the `img-public` bucket, and any data to the `imageData` table, showing them on the main page.

While flags could be used within the db and fetching, I instead opted to use a new bucket, `img-blog`, and a new table, `blogImgData`, to store the images that were uploaded to the blog posts.

### Intital changes to the upload api route

The image upload API route would need to be able to distinguish between images uploaded for the blog, and images uploaded for the main page.
The route was already being passed the filename, name, description, tags, isSale, so I decided to add a new flag, `bucket`, to the request body, to specify which bucket the image should be uploaded to.

```ts
- const { filename, name, description, tags, isSale } = await request.json()

+ const { filename, name, description, tags, isSale, bucket } = await request.json()
```

The bucket prop would then be used to determine the environment variable that would be used to upload the image to the correct bucket.

```ts
// Determine which bucket to use based on the bucket prop
const bucketName = bucket === 'image' 
  ? process.env.R2_IMAGE_BUCKET_NAME 
  : process.env.R2_BLOG_BUCKET_NAME
```

the command to create a presigned URL would then be updated to use the correct bucket.

```ts
const command = new PutObjectCommand({
-  Bucket: process.env.R2_IMAGE_BUCKET_NAME,
+  Bucket: bucketName,
  Key: keyName + '.' + fileExtension,
}) 

// get a signed URL for the PutObjectCommand
const url = await getSignedUrl(r2, command, { expiresIn: 60 }) 
```

The logic for adding the fileUrl to the db also had to change. Simply creating the fileUrl changed from

```ts
const fileUrl =`${siteConfig.bucketUrl}/${newFileName}`
```

to

```ts
const fileUrl = `${bucket === 'image' ? siteConfig.imageBucketUrl : siteConfig.blogBucketUrl}/${newFileName}`
```

To insert it into the correct table, an if satatement was used.

```ts
if (bucket === 'image') {
    // insert data into the imageData table
    await db.insert(imageData).values({
      uuid: keyName, 
      fileName: newFileName, 
      fileUrl: fileUrl,
      name: name,
      description: description,
      tags: tags,
    })
    
    // fetch what was just inserted
    const result = await db
      .select({
        id: imageData.id,
        fileUrl: imageData.fileUrl,
      })
      .from(imageData)
      .where(eq(imageData.uuid, sql.placeholder('uuid')))
      .execute({ uuid: keyName })
    
    // if the image is a sale image, insert it into the storeImages table
    if (isSale) {
      await db.insert(storeImages).values({
        imageId: result[0].id,
        imageUuid: keyName, 
        fileUrl: fileUrl,
        price: 100,
        stock: 10,
        visible: true,
      })
    }
  
  } else if (bucket === 'blog') {
    // but if its a blog image, insert it into the blogImgData table
    await db.insert(blogImgData).values({
      uuid: keyName,
      fileName: newFileName,
      fileUrl: fileUrl,
      name: name,
      description: description,
      tags: tags,
    })
  }
```

The Bucket was passed to the client component as a prop, and the request body was updated to include the bucket prop.
The client component was updated to use the new prop, even showing a different ui, hiding elements and changing text based on the bucket prop.

A type interface was created for either bucket, allowing the the bucket prop to be either 'image' or 'blog', and throwing an error if it was neither.

```ts
interface UploadImgProps {
  bucket: 'image' | 'blog'
}

// the bucket prop is passed from the parent component
export function UploadImg({ bucket }: UploadImgProps) {
```

https://github.com/theomiddleton/portfolio-project/commit/fb9baf0f65d5995aef681f1250a0cbd91adcf03b?diff=unified#diff-3eb0862682d38ce06d8e9d098e4c3b503f823852286b246da5f8d8961a323e86R120

