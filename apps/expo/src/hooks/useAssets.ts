import { Logger } from "@photonic/common"
import { desc, eq } from "drizzle-orm"
import React from "react"
import { LayoutAnimation } from "react-native"
import { db } from "~/expo/db"
import {
  getSchemaForRawLocalAsset,
  getSchemaForRawRemoteAsset,
} from "~/expo/db/asset"
import { asset, type Asset, type AssetInsert } from "~/expo/db/schema"
import { useAlerts } from "~/expo/design/components/alerts/useAlerts"
import type { AssetMap, RawLocalAsset } from "~/expo/lib/media-manager"
import { mediaManager } from "~/expo/lib/media-manager"
import { lastSyncTimeStorage } from "~/expo/lib/storage"
import { trpcClient } from "~/expo/state/TrpcProvider"

const logger = new Logger("useAssets")

export const useAssets = () => {
  const [assets, _setAssets] = React.useState<Array<Asset>>([])
  const [loading, setLoading] = React.useState(true)

  const { showNotification } = useAlerts()

  const assetMap = getAssetMap(assets)

  const setAssets = React.useCallback((arg: typeof assets) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    _setAssets(arg)
  }, [])

  const fetchLocalData = React.useCallback(async (clear = false) => {
    if (clear) {
      await db.delete(asset).execute()
    }
    const data = await db.select().from(asset).orderBy(desc(asset.creationTime))
    if (data.length > 0) {
      logger.log("Loading existing assets from DB")
      return data
    }
    return populateDB()
  }, [])

  const maybeRefreshRemoteData = React.useCallback(async () => {
    const now = Date.now()
    const lastSyncTime = lastSyncTimeStorage.get() ?? now
    const diff = now - lastSyncTime
    if (diff < 60_000) return

    logger.log("Fetching remote assets")
    let remoteAssets: Array<AssetInsert> = []
    let nextCursor
    do {
      const data = await trpcClient.photo.list.query({
        cursor: nextCursor,
        updatedAfterMs: lastSyncTime,
      })
      remoteAssets = data.assets.map(getSchemaForRawRemoteAsset)
      nextCursor = data.nextCursor
    } while (nextCursor)
    logger.log("Fetching remote assets done")

    // images that the server needs to delete from its records since it needs re-uploading (local)
    const outDatedRemotely = []
    // images that the device needs to delete from its records since it needs re-downloading (remote)
    const outDatedLocally = []
    // images that both server and device have and are up to date (localRemote)
    const equal = []
    // images that the device needs to save locally (remote)
    const remoteOnly = []

    for (const remoteAsset of remoteAssets) {
      const item = assetMap[remoteAsset.name]
      if (item) {
        if (item.modificationTime === remoteAsset.modificationTime) {
          // localRemote, up to date
          equal.push(item)
        } else if (item.modificationTime > remoteAsset.modificationTime) {
          // localRemote, outdated locally
          outDatedRemotely.push(item)
        } else {
          // localRemote, outdated remotely
          outDatedLocally.push(item)
        }
      } else {
        // remote
        remoteOnly.push(remoteAsset)
      }
    }

    lastSyncTimeStorage.save(now)
  }, [assetMap])

  React.useEffect(() => {
    fetchLocalData().then(data => {
      setAssets(data)
      setLoading(false)
      // Assume stored remote data is out of date. How to reconcile?
      // - start fetching remote assets. these could be thousands of records
      // - fetch 200 each, from newest to oldest. keep refreshing until we have all assets
      // - save lastSyncTime to local storage
      // - next time we start, only fetch remote records that were updatedAt > lastSyncTime
    })

    const updateAsset = async (item: RawLocalAsset) => {
      if (item.mediaType !== "photo") return
      await db
        .update(asset)
        .set({
          type: "local",
          modificationTime: item.modificationTime,
          creationTime: item.creationTime,
          duration: item.duration,
          height: item.height,
          width: item.width,
          localId: item.id,
          name: item.filename,
          uri: item.uri,
        })
        .where(eq(asset.name, item.filename))
    }

    const sub = mediaManager.addListener(async change => {
      if (change.hasIncrementalChanges) {
        logger.log("Received incremental changes", change)

        for (const updated of change.updatedAssets ?? []) {
          if (updated.mediaType !== "photo") continue
          await updateAsset(updated)
        }

        for (const item of change.deletedAssets ?? []) {
          if (item.mediaType !== "photo") continue
          await db.delete(asset).where(eq(asset.localId, item.id))
        }

        if (change.insertedAssets) {
          const insertedPhotos = change.insertedAssets.filter(
            t => t.mediaType === "photo",
          )
          if (insertedPhotos.length !== 0) {
            await db
              .insert(asset)
              .values(insertedPhotos.map(getSchemaForRawLocalAsset))
          }
        }

        setAssets(await fetchLocalData())
      } else {
        setAssets(await fetchLocalData())
        showNotification({
          message: "Received non-incremental changes.",
          dismissAfterMs: 5000,
        })
      }
    })

    return () => {
      sub.remove()
    }
  }, [fetchLocalData, setAssets, showNotification])

  return { assets, assetMap, loading }
}

async function populateDB() {
  const fetchMediaLibraryPage = (after?: string) => {
    return mediaManager.getAssetsAsync({
      after,
      first: Number.MAX_SAFE_INTEGER,
      sortBy: "creationTime",
      mediaType: [
        mediaManager.MediaType.photo,
        // TODO: ExpoMedia.MediaType.video
      ],
    })
  }

  logger.log("Populating DB")
  let assets: Array<Asset> = []
  let cursor
  do {
    const data = await fetchMediaLibraryPage(cursor)
    logger.log(`page ${data.assets.length}`, `endCursor: ${cursor}`)
    const saved = await db
      .insert(asset)
      .values(data.assets.map(getSchemaForRawLocalAsset))
      .returning()
    assets = assets.concat(saved)
    cursor = data.hasNextPage ? data.endCursor : null
  } while (cursor)
  logger.log("Populating DB done")

  return assets
}

export function getAssetMap(assets: Array<Asset>): AssetMap {
  let record: Record<string, Asset> = {}
  for (let i = 0; i < assets.length; i++) {
    const item = assets[i]
    if (item) {
      record[item.name] = item
    }
  }
  return record
}
