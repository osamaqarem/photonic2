import { assert } from "@photonic/common"
import { desc, getTableColumns, inArray, sql, type SQL } from "drizzle-orm"
import type { SQLiteTable } from "drizzle-orm/sqlite-core"
import { db } from "~/expo/db"
import type { Asset, AssetInsert } from "~/expo/db/schema"
import { asset } from "~/expo/db/schema"
import type { RawLocalAsset } from "~/expo/lib/media-manager"
import { deviceIdStorage } from "~/expo/lib/storage"
import { useAuth } from "~/expo/state/auth-store"
import type { trpcClient } from "~/expo/state/TrpcProvider"

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
    creationTime: new Date(rawRemoteAsset.creationTime).getTime(),
    modificationTime: new Date(rawRemoteAsset.modificationTime).getTime(),
    userId: rawRemoteAsset.userId,
  }
}

export function getSchemaForRawLocalAsset(
  rawAsset: RawLocalAsset,
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

const buildConflictUpdateColumns = <
  T extends SQLiteTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table)
  return columns.reduce((acc, column) => {
    const colName = cls[column]?.name
    acc[column] = sql.raw(`excluded.${colName}`)
    return acc
  }, {} as Record<Q, SQL>)
}

export const assetRepo = {
  clear: () => {
    return db.delete(asset).execute()
  },
  all: () => {
    return db.select().from(asset).orderBy(desc(asset.creationTime))
  },
  deleteMany: (assets: Array<Asset>) => {
    return db.delete(asset).where(
      inArray(
        asset.localId,
        assets.map(a => a.id),
      ),
    )
  },
  create: (data: Array<AssetInsert>) => {
    if (data.length === 0) return []
    return db.insert(asset).values(data).returning()
  },
  put: async (
    data: Array<AssetInsert>,
    onConflictDontUpdateFields: Array<keyof AssetInsert> = [],
  ) => {
    const updateFields = (
      Object.keys(getTableColumns(asset)) as typeof onConflictDontUpdateFields
    ).filter(col => !onConflictDontUpdateFields.includes(col))

    if (data.length === 0) return []
    return db
      .insert(asset)
      .values(data)
      .onConflictDoUpdate({
        target: asset.id,
        set: buildConflictUpdateColumns(asset, updateFields),
      })
      .returning()
  },
}
