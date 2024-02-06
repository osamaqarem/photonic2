import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const photos = sqliteTable("photos", {
  id: integer("id").primaryKey().notNull(),
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

export type BaseAsset = typeof photos.$inferSelect

export type LocalAsset = BaseAsset & {
  type: "local"
  localId: string
  uri: string
  uploadProgressPct: string
}

export type RemoteAsset = Omit<BaseAsset, "localId" | "uri"> & {
  type: "remote"
  url: string
}

export type LocalRemoteAsset = BaseAsset & {
  type: "localRemote"
  localId: string
  uri: string
}

export type GenericAsset = LocalAsset | RemoteAsset | LocalRemoteAsset

// map of asset name to asset
export type AssetRecordMap = Record<string, GenericAsset>
