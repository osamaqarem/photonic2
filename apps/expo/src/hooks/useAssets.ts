import { Logger } from "@photonic/common"
import React from "react"
import { LayoutAnimation } from "react-native"
import { useSharedValue } from "react-native-reanimated"
import {
  assetRepo,
  getSchemaForRawLocalAsset,
  getSchemaForRawRemoteAsset,
} from "~/expo/db/asset-repo"
import { type Asset, type AssetInsert } from "~/expo/db/schema"
import { useSafeIntervalRef } from "~/expo/hooks/useSafeIntervalRef"
import { mediaManager, type RawLocalAsset } from "~/expo/lib/media-manager"
import { lastSyncTimeStorage } from "~/expo/lib/storage"
import { trpcClient } from "~/expo/state/TrpcProvider"

const logger = new Logger("useAssets")

export const useAssets = () => {
  const [assets, _setAssets] = React.useState<Array<Asset>>([])
  const [loading, setLoading] = React.useState(true)
  const assetMap = useSharedValue<AssetMap>({})

  const remoteSyncInterval = useSafeIntervalRef()

  const setAssets = React.useCallback((data: Array<Asset>) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    _setAssets(data)
  }, [])

  const fetchLocalData = React.useCallback(async (clear = false) => {
    if (clear) {
      await assetRepo.clear()
      lastSyncTimeStorage.delete()
    }
    const data = await assetRepo.getAll()
    if (data.length > 0) return data
    return populateDB()
  }, [])

  const refreshQuery = React.useCallback(async () => {
    const data = await fetchLocalData(false)
    const updatedMap = getAssetMap(data)
    assetMap.value = updatedMap
    setAssets(data)
  }, [assetMap, fetchLocalData, setAssets])

  const syncRemote = React.useCallback(
    async (force = false) => {
      await maybeSyncRemote(assetMap.value, force)
      refreshQuery()
    },
    [assetMap, refreshQuery],
  )

  React.useEffect(() => {
    ;(async () => {
      refreshQuery()
      setLoading(false)

      await syncRemote()
      remoteSyncInterval.current = setInterval(syncRemote, 60_000)
    })()
  }, [fetchLocalData, refreshQuery, remoteSyncInterval, setAssets, syncRemote])

  React.useEffect(() => {
    const sub = mediaManager.addListener(async change => {
      if (!change.hasIncrementalChanges) {
        await refreshQuery()
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
          const asset = assetMap.value[item.filename]
          if (asset?.type === "localRemote") {
            // asset has been deleted from device
            // if backup delete was needed, then it has also been done.
            // if backup delete was not needed, then the type must be changed `localRemote` to `local`
            // FIXME: how to determine if backup delete was needed?
          } else {
            await assetRepo.deleteById(item.id)
          }
        }

        if (change.insertedAssets) {
          let newAssets: Array<RawLocalAsset> = []
          for (const item of change.insertedAssets ?? []) {
            if (item.mediaType !== "photo") continue
            const existing = assetMap.value[item.filename]
            if (existing?.type === "remote") {
              // Remote asset has been downloaded to device
              // Must promote to `localRemote`
              // Handled in saveRemoteAssset
            } else {
              newAssets.push(item)
            }
          }

          await assetRepo.create(newAssets.map(getSchemaForRawLocalAsset))
        }
        await refreshQuery()
      }
    })

    return () => {
      sub.remove()
    }
  }, [assetMap.value, refreshQuery])

  return {
    assets,
    assetMap,
    loading,
    syncRemote,
  }
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
    const saved = await assetRepo.create(
      data.assets.map(getSchemaForRawLocalAsset),
    )
    assets = assets.concat(saved)
    cursor = data.hasNextPage ? data.endCursor : null
  } while (cursor)
  logger.log("Populating DB done")

  return assets
}

const syncLogger = new Logger("maybeSyncRemote")
async function maybeSyncRemote(assetMap: AssetMap, force = false) {
  const now = Date.now()
  const lastSyncTime = lastSyncTimeStorage.get() ?? 0
  const diff = now - lastSyncTime
  if (diff < 60_000 && !force) {
    syncLogger.log(
      `Skipping remote sync, last sync at: ${new Date(
        lastSyncTime,
      ).toISOString()}`,
    )
    return
  }
  syncLogger.log(`Remote sync begin | Forced: ${force}`)

  const remoteItems = await paginateRemoteAssets(lastSyncTime)
  const itemsToUpdate = await filterNeedsLocalWrite(remoteItems, assetMap)
  syncLogger.log(`remoteItems.length: ${remoteItems.length}`)
  syncLogger.log(`itemsToUpdate.length: ${itemsToUpdate.length}`)

  assetRepo
    .put(itemsToUpdate)
    .then(() => {
      syncLogger.log("Remote sync end")
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
        limit: 500,
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
      if (!item) {
        // remote only, no local record
        itemsToSave.push(remoteAsset)
      } else {
        // item exists locally, but which is newer, local or remote?
        if (item.modificationTime === remoteAsset.modificationTime) {
          // localRemote, up to date
          // e.g. recently uploaded
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
          // localRemote, outdated locally
          // remote only, pretend there's no local record
          itemsToSave.push({
            ...remoteAsset,
            id: item.id,
            type: "remote",
          })
        }
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
