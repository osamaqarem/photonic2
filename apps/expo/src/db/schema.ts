import { nanoid } from "@photonic/common/nanoid"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

/**
 * Note on importing packages for use with `defaultFn`:
 * drizzle-kit uses a cjs loader that will choke on esm code when resolving packages.
 */
export const asset = sqliteTable("asset", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => "ast_" + nanoid()),
  deviceId: text("deviceId").notNull(),
  localId: text("localId").unique(),
  name: text("name").unique().notNull(),
  type: text("type", { enum: ["local", "remote", "localRemote"] }).notNull(),
  mediaType: text("mediaType", { enum: ["photo", "video"] }).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  duration: integer("duration").notNull(),
  creationTime: integer("creationTime").notNull(),
  modificationTime: integer("modificationTime").notNull(),
  uri: text("uri").unique(),
  userId: text("userId").notNull(),
})

export type Asset = typeof asset.$inferSelect
export type AssetInsert = typeof asset.$inferInsert
