import { serial, varchar, timestamp, pgTableCreator, integer, text, boolean, uuid } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

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
  order: integer('order').default(0).notNull(),
  uploadedAt: timestamp('uploadedAt').defaultNow(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
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

export const videos = pgTable('videos', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  hlsUrl: text('hlsUrl').notNull(),
  thumbnail: text('thumbnailUrl'),
  duration: text('duration'),
  views: text('views').default('0'),
  isVisible: boolean('isVisible').default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
})

export const customPages = pgTable('customPages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slug: text('slug').notNull().unique(),
  isPublished: boolean('isPublished').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const customImgData = pgTable('customImgData', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull(),
  fileName: varchar('fileName', { length: 256 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }),
  uploadedAt: timestamp('uploadedAt').defaultNow(),
})

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(), // stored in pennies
  imageUrl: text('imageUrl').notNull(),
  stripeProductId: text('stripeProductId').notNull(),
  stripePriceId: text('stripePriceId').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('productId').references(() => products.id),
  stripeSessionId: text('stripeSessionId').notNull(),
  status: text('status').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export type Product = typeof products.$inferSelect
export type Order = typeof orders.$inferSelect

export const aboutRelations = relations(about, ({ many }) => ({
  images: many(aboutImages)
}))

export const aboutImagesRelations = relations(aboutImages, ({ one }) => ({
  about: one(about, {
    fields: [aboutImages.aboutId],
    references: [about.id],
  }),
}))