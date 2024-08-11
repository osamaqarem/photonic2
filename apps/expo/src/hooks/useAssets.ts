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
import { mediaManager } from "~/expo/lib/media-manager"
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

  const fetchLocalData = React.useCallback(
    async (mode: "reset" | "reload" | "normal" = "normal") => {
      if (mode === "reset") {
        await assetRepo.drop()
        lastSyncTimeStorage.delete()
        return populateDB()
      } else if (mode === "normal") {
        const data = await assetRepo.list()
        return data
      }
      return populateDB()
    },
    [],
  )

  const refreshQuery = React.useCallback(
    async (mode: Parameters<typeof fetchLocalData>[number] = "normal") => {
      const data = await fetchLocalData(mode)
      const updatedMap = getAssetMap(data)
      assetMap.value = updatedMap
      setAssets(data)
    },
    [assetMap, fetchLocalData, setAssets],
  )

  const syncRemote = React.useCallback(
    async (force = false) => {
      await maybeSyncRemote(assetMap.value, force)
      await refreshQuery("normal")
    },
    [assetMap, refreshQuery],
  )

  React.useEffect(() => {
    ;(async () => {
      await refreshQuery("reload")
      setLoading(false)

      await syncRemote()
      remoteSyncInterval.current = setInterval(syncRemote, 60_000)
    })()
  }, [fetchLocalData, refreshQuery, remoteSyncInterval, setAssets, syncRemote])

  return {
    assets,
    assetMap,
    loading,
    syncRemote,
    refetchAssets: refreshQuery,
  }
}

async function populateDB() {
  const fetchMediaLibraryPage = (after?: string) => {
    return mediaManager.getAssetsAsync({
      after,
      first: Number.MAX_SAFE_INTEGER,
      sortBy: "creationTime",
      mediaType: [mediaManager.MediaType.photo],
    })
  }

  logger.log("Populating DB")
  let assets: Array<Asset> = []
  let cursor
  do {
    const data = await fetchMediaLibraryPage(cursor)
    logger.log(`page ${data.assets.length}`, `endCursor: ${cursor}`)
    const saved = await assetRepo.update(
      data.assets.map(getSchemaForRawLocalAsset),
      ["type", "uri"],
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
    .update(itemsToUpdate)
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
