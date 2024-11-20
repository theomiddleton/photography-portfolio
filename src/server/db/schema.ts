import { serial, varchar, timestamp, pgTableCreator, integer, text, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const pgTable = pgTableCreator((name) => `portfolio-project_${name}`)

export const imageData = pgTable('imageData', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull(),
  fileName: varchar('fileName', { length: 256 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 256 }),
  tags: varchar('tags', { length: 256 }),
  visible: boolean('visible').default(true).notNull(),
  uploadedAt: timestamp('uploadedAt').defaultNow(),
})

export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  isDraft: boolean('draft').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
})

export const blogImgData = pgTable('blogImgData', {
  id: serial('id').primaryKey(),
  blogId: integer('blogId').references(() => blogs.id),
  draftId: varchar('draftId', { length: 36 }),
  uuid: varchar('uuid', { length: 36 }).notNull(),
  fileName: varchar('fileName', { length: 256 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  uploadedAt: timestamp('uploadedAt').defaultNow(),
})

export const aboutImgData = pgTable('aboutImgData', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull(),
  fileName: varchar('fileName', { length: 256 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }),
  uploadedAt: timestamp('uploadedAt').defaultNow(),
})

export const about = pgTable('about', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  current: boolean('current').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
})

export const aboutImages = pgTable('aboutImages', {
  id: serial('id').primaryKey(),
  aboutId: integer('about_id').notNull().references(() => about.id),
  name: varchar('name', { length: 256 }).notNull(),
  url: varchar('url', { length: 512 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const storeImages = pgTable('storeImages', {
  id: serial('id').primaryKey(),
  imageId: integer('imageId'),
  imageUuid: varchar('uuid', { length: 36 }),
  fileUrl: varchar('fileUrl', { length: 256 }),
  price: integer('price').notNull(),
  stock: integer('stock').notNull(),
  visible: boolean('visible').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

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
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  password: varchar('password', { length: 256 }).notNull(),
  role: varchar('role', { length: 256 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
})

export const logs = pgTable('logs', {
  id: serial('id').primaryKey(),
  scope: varchar('scope', { length: 256 }).notNull(),
  log: text('log').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const aboutRelations = relations(about, ({ many }) => ({
  images: many(aboutImages)
}))

export const aboutImagesRelations = relations(aboutImages, ({ one }) => ({
  about: one(about, {
    fields: [aboutImages.aboutId],
    references: [about.id],
  }),
}))