import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { nanoid } from "~/expo/lib/nanoid"

/**
 * Note on importing packages for use with `defaultFn`:
 * drizzle-kit uses a cjs loader that will choke on esm code when resolving packages.
 */
export const asset = sqliteTable("asset", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => "ast_" + nanoid()),
  deviceId: text("deviceId"),
  localId: text("localId"),
  name: text("name").notNull(),
  type: text("type", { enum: ["local", "remote", "localRemote"] }).notNull(),
  mediaType: text("text", { enum: ["photo", "video"] }).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  duration: integer("duration").notNull(),
  creationTime: integer("creationTime").notNull(),
  uri: text("string"),
  userId: text("userId").notNull(),
})

export type Asset = typeof asset.$inferSelect
export type AssetInsert = typeof asset.$inferInsert
