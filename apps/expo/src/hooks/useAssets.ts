import { Logger } from "@photonic/common"
import React from "react"
import { LayoutAnimation } from "react-native"
import {
  assetRepo,
  getSchemaForRawLocalAsset,
  getSchemaForRawRemoteAsset,
} from "~/expo/db/asset-repo"
import { type Asset, type AssetInsert } from "~/expo/db/schema"
import { useSafeIntervalRef } from "~/expo/hooks/useSafeIntervalRef"
import { mediaManager } from "~/expo/lib/media-manager"
import { lastSyncTimeStorage } from "~/expo/lib/storage"
import { trpcClient } from "~/expo/state/TrpcProvider"

const logger = new Logger("useAssets")

export const useAssets = () => {
  const [{ assets, assetMap }, _setAssets] = React.useState({
    assets: [] as Array<Asset>,
    assetMap: {} as AssetMap,
  })
  const [loading, setLoading] = React.useState(true)

  const remoteSyncInterval = useSafeIntervalRef()

  const setAssets = React.useCallback(
    (args: Parameters<typeof _setAssets>[number]) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      _setAssets(args)
    },
    [],
  )

  const fetchLocalData = React.useCallback(async (clear = false) => {
    if (clear) {
      await assetRepo.clear()
    }
    const data = await assetRepo.getAll()
    if (data.length > 0) {
      logger.log("Loading existing assets from DB")
      return data
    }
    return populateDB()
  }, [])

  React.useEffect(() => {
    ;(async () => {
      const data = await fetchLocalData()
      const map = getAssetMap(data)

      setAssets({ assets: data, assetMap: map })
      setLoading(false)

      maybeSyncRemote(map)
      remoteSyncInterval.current = setInterval(() => {
        maybeSyncRemote(map)
      }, 60_000)
    })()
  }, [fetchLocalData, remoteSyncInterval, setAssets])

  React.useEffect(() => {
    const sub = mediaManager.addListener(async change => {
      if (!change.hasIncrementalChanges) {
        await fetchLocalData()
        logger.warn("Received non-incremental changes.")
      } else {
        logger.log("Received incremental changes", change)

        for (const updated of change.updatedAssets ?? []) {
          if (updated.mediaType !== "photo") continue
          await assetRepo.patch(updated.filename, {
            ...updated,
            mediaType: "photo",
            type: "local",
          })
        }

        for (const item of change.deletedAssets ?? []) {
          if (item.mediaType !== "photo") continue
          await assetRepo.deleteById(item.id)
        }

        if (change.insertedAssets) {
          const insertedPhotos = change.insertedAssets.filter(
            t => t.mediaType === "photo",
          )
          if (insertedPhotos.length !== 0) {
            await assetRepo.create(
              insertedPhotos.map(getSchemaForRawLocalAsset),
            )
          }
        }
        await fetchLocalData()
      }
    })

    return () => {
      sub.remove()
    }
  }, [fetchLocalData])

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
    const saved = await assetRepo
      .create(data.assets.map(getSchemaForRawLocalAsset))
      .returning()
    assets = assets.concat(saved)
    cursor = data.hasNextPage ? data.endCursor : null
  } while (cursor)
  logger.log("Populating DB done")

  return assets
}

const syncLogger = new Logger("maybeSyncRemote")
async function maybeSyncRemote(assetMap: AssetMap) {
  const now = Date.now()
  const lastSyncTime = lastSyncTimeStorage.get() ?? now
  const diff = now - lastSyncTime
  if (diff < 60_000) {
    syncLogger.log(
      `Skipping remote sync, last sync at: ${new Date(
        lastSyncTime,
      ).toISOString()}`,
    )
    return
  }
  syncLogger.log("Remote sync ongoing")

  const remoteItems = await paginateRemoteAssets(lastSyncTime)
  const itemsToUpdate = await filterNeedsLocalWrite(remoteItems, assetMap)

  syncLogger.log("itemsToUpdate", itemsToUpdate.length)

  assetRepo
    .put(itemsToUpdate)
    .then(() => {
      syncLogger.log("Remote sync done")
      lastSyncTimeStorage.save(now)
    })
    .catch(syncLogger.error)

  async function paginateRemoteAssets(updatedAfterMs: number) {
    logger.log("Fetching remote assets")
    let remoteAssets: Array<AssetInsert> = []
    let nextCursor
    do {
      const data = await trpcClient.photo.list.query({
        cursor: nextCursor,
        updatedAfterMs,
      })
      remoteAssets = data.assets.map(getSchemaForRawRemoteAsset)
      nextCursor = data.nextCursor
    } while (nextCursor)

    logger.log("Fetching remote assets done")
    return remoteAssets
  }

  async function filterNeedsLocalWrite(
    remoteAssets: Array<AssetInsert>,
    assetMap: AssetMap,
  ) {
    const itemsToSave: Array<AssetInsert> = []
    for (const remoteAsset of remoteAssets) {
      const item = assetMap[remoteAsset.name]
      if (item) {
        if (item.modificationTime === remoteAsset.modificationTime) {
          // localRemote, up to date
          // should do nothing, but to ensure correctness we will re-save it as a `localRemote` record
          itemsToSave.push({
            ...item,
            type: "localRemote",
          })
        } else if (item.modificationTime > remoteAsset.modificationTime) {
          // localRemote, outdated remotely
          // must update remote record
          // we can ignore doing anything here, as asset must already be marked `local` in local db.
          // TODO: checking if file re-upload is required vs only metadata update
        } else {
          // localRemote, outdated remotely
          // remote only, no local record
          itemsToSave.push({
            ...remoteAsset,
            id: item.id,
            type: "remote",
          })
        }
      } else {
        // remote only, no local record
        itemsToSave.push(remoteAsset)
      }
    }
    return itemsToSave
  }
}

// Filename/asset map
// it's used with Reaniamted so it can't be a `Map`
export type AssetMap = Record<string, Asset>
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
