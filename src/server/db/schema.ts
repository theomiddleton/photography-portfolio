import { drizzle } from 'drizzle-orm/node-postgres';

import { serial, varchar, timestamp, pgTableCreator } from 'drizzle-orm/pg-core';

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
