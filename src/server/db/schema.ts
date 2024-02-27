import { relations, sql } from 'drizzle-orm'
import {
  bigint,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core'

export const mysqlTable = mysqlTableCreator((name) => `portfolio-project_${name}`)

export const imageData = mysqlTable(
  "imageData",
  {
    //id: bigint("id", { mode: "number" }).primaryKey(),
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    uuid: varchar("uuid", { length: 36 }).notNull(),
    fileName: varchar("fileName", { length: 256 }).notNull(),
    fileUrl: varchar("fileUrl", { length: 256 }).notNull(),
    name: text("name"),
    description: text("description"),
    tags: text("tags"),
    uploadedAt: timestamp("uploadedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    modifiedAt: timestamp("modifiedAt").onUpdateNow(),
  },
  (example) => ({
    uuidIndex: index("uuid_idx").on(example.uuid),
  })
)