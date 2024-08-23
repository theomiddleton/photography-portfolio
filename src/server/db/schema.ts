import { drizzle } from 'drizzle-orm/node-postgres';

import { serial, varchar, timestamp, pgTableCreator, integer, text, boolean } from 'drizzle-orm/pg-core';

export const pgTable = pgTableCreator((name) => `portfolio-project_${name}`)

export const imageData = pgTable('imageData', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull(),
  fileName: varchar('fileName', { length: 256 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }),
  description: varchar('description', { length: 256 }),
  tags: varchar('tags', { length: 256 }),
  uploadedAt: timestamp('uploadedAt').defaultNow().notNull(),
  //modifiedAt: timestamp('modifiedAt').$onUpdate(() => new Date()),
  //modifiedAt: timestamp('modifiedAt').defaultNow(),
});

export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  visible: boolean('visible').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
  tempId: varchar('tempId', { length: 256 }),
});

export const blogImages = pgTable('blogImages', {
  id: serial('id').primaryKey(),
  blogId: serial('blog_id').references(() => blogs.id),
  imageId: varchar('imageId', { length: 256 }).notNull(),
  fileName: varchar('fileName', { length: 256 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 256 }).notNull(),
  description: varchar('description', { length: 256 }),
  uploadedAt: timestamp('uploadedAt').defaultNow().notNull(),
});

export const about = pgTable('about', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  current: boolean('current').default(false).notNull(),
  imageBool: boolean('imageBool').default(false).notNull(),
  imageUrl: varchar('imageUrl', { length: 256 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
});

export const storeImages = pgTable('storeImages', {
  id: serial('id').primaryKey(),
  imageId: integer('imageId').references(() => imageData.id).notNull(),
  price: integer('price').notNull(),
  stock: integer('stock').notNull(),
});