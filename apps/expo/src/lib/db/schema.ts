import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { deviceIdStorage } from "~/expo/lib/device-id"
import { nanoid } from "~/expo/lib/nanoid"
import { useAuth } from "~/expo/stores/auth-store"

export const asset = sqliteTable("asset", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => "ass_" + nanoid()),
  deviceId: text("deviceId")
    .notNull()
    .$defaultFn(() => {
      const id = deviceIdStorage.get()
      if (!id) throw new Error("`DeviceIdKey` value was undefined.")
      return id
    }),
  localId: text("localId"),
  name: text("name").notNull(),
  type: text("type", { enum: ["local", "remote", "localRemote"] }).notNull(),
  mediaType: text("text", { enum: ["photo", "video"] }).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  duration: integer("duration").notNull(),
  creationTime: integer("creationTime", { mode: "timestamp_ms" }).notNull(),
  uri: text("string"),
  userId: text("userId")
    .notNull()
    .$defaultFn(() => {
      const { userId } = useAuth.getState()
      if (!userId) throw new Error("`userId` is null")
      return userId
    }),
})

export type Asset = typeof asset.$inferSelect
export type AssetInsert = typeof asset.$inferInsert
