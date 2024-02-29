# Commits

## This doc will contain all the commits made to the project. It will be updated every time a new commit is made

### 🎉 Create initial project files

This commit contains the initial project files. It is the starting point of the project.

[Link](https://github.com/theomiddleton/portfolio-project/commit/c915347fbbf0e3e7e10a26a0903a5b9ce899c053)

### 🚧 Create a simple landing page, and add shadcn/ui, tailwind, and more

This commit contains the creation of a simple landing page, it uses shadcn/ui, and tailwind, so they have been added to the project. Radix UI has also been added to the project as a dev dependency of shadcn/ui, and for some icons.

[Link](https://github.com/theomiddleton/portfolio-project/commit/8b6e7ddec8a36b5f4a4ae7f525e519b121ef90f4)

### 🚧 Start on file upload and start commit documentation

This commit contains the start of the file upload feature, and the start of the this, the commit documentation. The admin page is simply the ui for now, with the functionality to be added later.

[Link](https://github.com/theomiddleton/portfolio-project/commit/d9eb6947b0de1ab61156455bd2a9722c6f206961)

### ✨ Add image upload to a cloudflare R2 bucket

This commit adds uploading images to a cloudflare R2 bucket. It does this through the aws sdk, as that is how you interface with a cloudflare R2 bucket as per the cloudflare documentation.

[Link](https://github.com/theomiddleton/portfolio-project/commit/92321d991622563c74aab7cc66200915e55f0bd7)

### 🗃️ Add database and image data schema

This commit adds the database libraries, for the database I am using planetscale, so I can host it online. The database is MySQL, and I am using drizzle to interface with it, drizzle is an orm for MySQL, and other databases, but I am only using it for MySQL. The image data schema is also added, this is the schema for the image data, which is things like the file URL, the file name, when it was uploaded and more.

[Link](https://github.com/theomiddleton/portfolio-project/commit/29d2e8dd939e002c3d28b4a77f1a9b263b39ecf0)

### 🗃️ Add full delete and uploading image data to the database

This commit adds the full delete functionality, and the uploading of the image data to the database. The full delete functionality is the ability to delete the image from the cloudflare R2 bucket, and the database. The image data is uploaded to the database, and the file URL is also uploaded to the database.

[Link](https://github.com/theomiddleton/portfolio-project/commit/e52be60c283ab3bd446c650ba34ade9a38ebc2be)

### 🎉 Fetch ImageUrls from DB, and start on main image gallery

This is a larger commit than most before. It adds the working fetching of ImageUrls and ImageData from the database, meaning, now images can be seen without hardcoding their URLs.  

This allowed me to add a image carousel to the admin page, allowing for the preview of all images with their data stored in the database. In adding this carousel, I refactored the admin page, making the UI more inline with the rest of the design language, and adding the ability to add more data to the images, allowing for image titles, tags, and descriptions.

Since I could now fetch imageData, it allowed me to start on the main image gallery, which is simpler to create than I originally thought with the help of the tailwind class 'columns' in the layout section. This allows the images to be added to a gallery, while preserving their original aspect ratio.
The code:  

```tsx
<section className="columns-4 max-h-5xl mx-auto space-y-4"> 
  {imageUrls.map((url) => ( 
    <div key={url} className="rounded-md overflow-hidden hover:scale-[0.97] duration-100"> 
      <a href={url} target="_blank" rel="noreferrer"> 
        <img src={url} alt="img" height={600} width={400} /> 
      </a> 
    </div> 
  ))} 
</section> 
```

The first line is what makes the gallery work. the `columns-4` creates 4 columns of images, `space-y-4` creates a gap of 16px vertically between images.
The second line is what assigns the imageUrl map, basically an array of the imageUrls fetched from the db, to the `<img>` tag, making it render on the page.
The `<div>` is currently only used to slightly scale down the image when hovered, to create a little intractability in the gallery.
The `<a>` Is for when the image is clicked. currently it directs to the imageUrl, but with will change in the future, either linking to a page showing the image with its title, description and tags; or linking to its store page allowing for the purchase of the print.
Finaly, the `<img>` tag is what shows the actual image. The url is the current url selected from the imageUrls map, a map in javascript being an object holding key value pairs, in the original insertion order. The map remembering the original insertion order is important, as it would allow for the custom order of images in the future.

Fetching ImageUrls from the database is done with this function

```ts
  const result = await db.select({
    id: imageData.id,
    fileUrl: imageData.fileUrl,
  }).from(imageData)
  const imageUrls = result.map((item) => item.fileUrl) 
```

For the image map it only fetches the Id and fileUrl currently, as the gallery only shows the images, metadata, tags, titles, and description would only need to be fetched for the image page, where those things are shown.
The function works as follows, result is a json array fetched straight from the db, and is in the form

```js
[
  {
    id: 1,
    fileUrl: 'https://img.theomiddleton.me/03ea4dc1-4239-4fbf-897e-5d32d603e2b1.jpg'
  },
  {
    id: 2,
    fileUrl: 'https://img.theomiddleton.me/34081e3c-af18-4c0d-b324-44a01a907af7.jpg'
  },
  {
    id: 3,
    fileUrl: 'https://img.theomiddleton.me/e40c05e3-137d-4fc9-a928-ea18d0409eea.jpg'
  },
  {
    id: 4,
    fileUrl: 'https://img.theomiddleton.me/3b63345e-b5f0-4aba-b9f1-08d5a64690d3.jpg'
  },
  {
    id: 5,
    fileUrl: 'https://img.theomiddleton.me/5064ac81-091c-46ee-913c-e19e64a1beb9.jpg'
  },
  {
    id: 6,
    fileUrl: 'https://img.theomiddleton.me/3f21027e-5b4a-456c-b517-9f6614f05815.jpg'
  },
  {
    id: 7,
    fileUrl: 'https://img.theomiddleton.me/921d85de-c6e4-4ff7-96e0-6add158a37ed.jpg'
  }
]
```

The result is then put into a map object and takes the form:

```js
[
  'https://img.theomiddleton.me/03ea4dc1-4239-4fbf-897e-5d32d603e2b1.jpg',
  'https://img.theomiddleton.me/34081e3c-af18-4c0d-b324-44a01a907af7.jpg',
  'https://img.theomiddleton.me/e40c05e3-137d-4fc9-a928-ea18d0409eea.jpg',
  'https://img.theomiddleton.me/3b63345e-b5f0-4aba-b9f1-08d5a64690d3.jpg',
  'https://img.theomiddleton.me/5064ac81-091c-46ee-913c-e19e64a1beb9.jpg',
  'https://img.theomiddleton.me/3f21027e-5b4a-456c-b517-9f6614f05815.jpg',
  'https://img.theomiddleton.me/921d85de-c6e4-4ff7-96e0-6add158a37ed.jpg'
]
```

By making it only the urls, it is easier to parse for displaying the images, as shown before; However, there is the ability to include the Id in the key value pair for custom image ordering.

[Link](https://github.com/theomiddleton/portfolio-project/commit/36c7af846e4feb1c538d18e157f99c86281d9dd7)
