import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 36)

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey().notNull().$defaultFn(nanoid),
  localId: text("local_id"),
  name: text("name").notNull().unique(),
  type: text("type", { enum: ["local", "remote", "localRemote"] }).notNull(),
  mediaType: text("text", { enum: ["photo", "video"] }).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  duration: integer("duration").notNull(),
  creationTime: integer("creation_time", { mode: "timestamp_ms" }).notNull(),
  uri: text("string"),
})

export type Asset = typeof assets.$inferSelect
export type AssetInsert = typeof assets.$inferInsert
