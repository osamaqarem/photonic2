import { assert } from "@photonic/common"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import type { LocalMediaAsset } from "~/expo/features/home/utils/media-manager"
import { deviceIdStorage } from "~/expo/lib/device-id"
import { nanoid } from "~/expo/lib/nanoid"
import { useAuth } from "~/expo/stores/auth-store"
import type { trpcClient } from "~/expo/stores/TrpcProvider"

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
  localId: text("localId"),
  name: text("name").notNull(),
  type: text("type", { enum: ["local", "remote", "localRemote"] }).notNull(),
  mediaType: text("text", { enum: ["photo", "video"] }).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  duration: integer("duration").notNull(),
  creationTime: integer("creationTime").notNull(),
  modificationTime: integer("modificationTime").notNull(),
  uri: text("string"),
  userId: text("userId").notNull(),
})

export type Asset = typeof asset.$inferSelect
export type AssetInsert = typeof asset.$inferInsert

export function getSchemaForRawLocalAsset(
  rawAsset: LocalMediaAsset,
): AssetInsert {
  const deviceId = deviceIdStorage.get()
  const { user } = useAuth.getState()
  assert(user?.id)

  return {
    localId: rawAsset.id,
    name: rawAsset.filename,
    type: "local",
    mediaType: rawAsset.mediaType as "photo" | "video",
    width: rawAsset.width,
    height: rawAsset.height,
    uri: rawAsset.uri,
    duration: rawAsset.duration,
    creationTime: rawAsset.creationTime,
    modificationTime: rawAsset.modificationTime,
    userId: user.id,
    deviceId,
  }
}

type RawRemoteAsset = Awaited<
  ReturnType<typeof trpcClient.photo.list.query>
>["assets"][number]

export function getSchemaForRawRemoteAsset(
  rawRemoteAsset: RawRemoteAsset,
): AssetInsert {
  return {
    deviceId: rawRemoteAsset.deviceId,
    localId: null,
    name: rawRemoteAsset.name,
    type: "remote",
    mediaType: rawRemoteAsset.mediaType as "photo" | "video",
    width: rawRemoteAsset.width,
    height: rawRemoteAsset.height,
    duration: rawRemoteAsset.duration,
    uri: null,
    creationTime: parseInt(rawRemoteAsset.creationTime, 10),
    modificationTime: parseInt(rawRemoteAsset.modificationTime, 10),
    userId: rawRemoteAsset.userId,
  }
}
