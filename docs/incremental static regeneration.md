# Incremental Static Regeneration

During the development of this project, ive noticed that the statically generated pages are not being regenerated when the database is updated.

This is due to the fact that server side pages are not being regenerated when the database is updated.

To fix this, we need to use the `dynamicParams` function to fetch the data from the database and pass it to the page.

[incremental static regeneration](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
