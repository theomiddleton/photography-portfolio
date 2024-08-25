# Dealing with SQL

For most, if not all of the websites functionality, it needs a database to go with, and, as much as noSql databases such as mongoDb, cassandra and redis have their place, sql with a ORM was the best choice for this project.

For the ORM (object relational mapper) I chose Drizzle, a relitivley new orm best suited for serverless databases.
The project started in mysql on a planetscale database, however, with pricing changes, i had to move to a different provider, namely, neon. 
Since it was serverless, and you write the schema within the project files, it was a pretty painless move, apart from the fact neon is a postgresql db.

Moving along with the project, i kept extending the schema, adding more tables and such, and recently, I encounted an interesting error in the storeOrders table.
the schema is as such:

```ts
export const storeOrders = pgTable('storeOrders', {
  id: serial('id').primaryKey(),
  customerName: varchar('customerName', { length: 256 }).notNull(),
  imageId: integer('imageId').references(() => imageData.id).notNull(),
  storeImageId: integer('storeImageId').references(() => storeImages.id).notNull(),
  address: varchar('address', { length: 256 }).notNull(),
  city: varchar('city', { length: 256 }).notNull(),
  postCode: varchar('postCode', { length: 256 }).notNull(),
  country: varchar('country', { length: 2 }).notNull(),
  status: varchar('status', { length: 256 }).notNull(),
  paymentMethod: varchar('paymentMethod', { length: 256 }).notNull(),
  quantity: integer('quantity').notNull(),
  total: integer('total').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

```

The problems occured when i tried querying this data for a graph. 
when I ran the code

```ts
const result = await db.select({
  id: storeOrders.id,
  storeImageId: storeImages.id,
  imageId: storeImages.imageId,
  quantity: storeOrders.quantity,
  price: storeImages.price,
  total: storeOrders.total,
  createdAt: storeOrders.createdAt,
})
.from(storeOrders)
.innerJoin(storeImages, eq(storeOrders.storeImageId, storeImages.id))
console.log("result", result)

const orderDate = await db.select({
  createdAt: storeOrders.createdAt,
}).from(storeOrders)
console.log("orderDate", orderDate)
```

I would get the console output:

```json
result []
orderDate [
  { createdAt: 2024-08-25T12:05:00.115Z },
  { createdAt: 2024-08-25T12:06:55.945Z }
]
```

but if I ran

```ts 
const result = await db.select({
  id: storeOrders.id,
  storeImageId: storeImages.id,
  imageId: storeImages.imageId,
  quantity: storeOrders.quantity,
  price: storeImages.price,
  total: storeOrders.total,
})
.from(storeOrders)
.innerJoin(storeImages, eq(storeOrders.storeImageId, storeImages.id))
console.log("result", result)

const orderDate = await db.select({
  createdAt: storeOrders.createdAt,
}).from(storeOrders)
console.log("orderDate", orderDate)
```

I would get the console output:

```json
result [
  {
    id: 2,
    storeImageId: 2,
    imageId: 2,
    quantity: 1,
    price: 100,
    total: 105
  },
  {
    id: 1,
    storeImageId: 3,
    imageId: 3,
    quantity: 1,
    price: 100,
    total: 105
  }
]
orderDate [
  { createdAt: 2024-08-25T12:05:00.115Z },
  { createdAt: 2024-08-25T12:06:55.945Z }
]
```

So createdAt was causing an error, but the data was clearly there, as you could query it itsself.

It was a strange error, that somehow stemmed from the relations of storeImageId and imageId, as, if you used a `.leftJoin` rather than a `.innerJoin` it would work.

AN `INNER JOIN` in SQL combines rows from two tables when a column matches in those tables.

A `LEFT JOIN` in SQL combines rows from two tables, but includes all rows from the first (left) table, even if there isn't a match in the right table.

| (Customers Table) | (Orders Table) |
|-------------------|----------------|
| customerId        | customerId     |
| 1                 | 1              |
| 2                 |                |
| 3                 | 3              |

an `INNER JOIN` would return customerId `1` and `3`

whereas a `LEFT JOIN` would return customerId `1`, `2`, and `3`
