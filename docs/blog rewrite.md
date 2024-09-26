# Blog rewrite

Other than the main page and image uploading, the blog was one of the first things I did, and the quality of the code reflects that.

## Starting the rewrite

The first thing I did was to completely remove the old blog code, other than the database schema.






### Errors when rewriting
On the base admin page, a table should show with all the blog posts.
On each row, theres an actions section, alowing the user to delete a post.
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