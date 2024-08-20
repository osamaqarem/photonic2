import { Logger } from "@photonic/common"
import { assetRepo, getSchemaForRawRemoteAsset } from "~/expo/db/asset-repo"
import type { Asset, AssetInsert } from "~/expo/db/schema"
import { lastSyncTimeStorage } from "~/expo/lib/storage"
import { trpcClient } from "~/expo/providers/TrpcProvider"

class SyncService {
  logger = new Logger("SyncService")

  async maybeSyncRemote(assets: Array<Asset>, force = false) {
    const now = Date.now()
    const lastSyncTime = lastSyncTimeStorage.get() ?? 0
    const diff = now - lastSyncTime
    if (diff < 60_000 && !force) {
      this.logger.log(
        `Skipping remote sync, last sync at: ${new Date(
          lastSyncTime,
        ).toISOString()}`,
      )
      return
    }
    this.logger.log(`Remote sync begin | Forced: ${force}`)

    const remoteItems = await this.paginateRemoteAssets(lastSyncTime)
    const save = await this.getNewOrOutdatedAssets(remoteItems, assets)

    assetRepo
      .update(save)
      .then(() => {
        this.logger.log("Remote sync end")
        lastSyncTimeStorage.save(now)
      })
      .catch(this.logger.error)
  }

  async paginateRemoteAssets(updatedAfterMs: number) {
    this.logger.log("Fetching remote assets")
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

    this.logger.log("Fetching remote assets done")
    return remoteAssets
  }

  async getNewOrOutdatedAssets(
    remoteAssets: Array<AssetInsert>,
    assets: Array<Asset>,
  ) {
    const itemsToSave: Array<AssetInsert> = []
    for (const remoteAsset of remoteAssets) {
      const item = assets.find(item => item.name === remoteAsset.name)
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

export const syncService = new SyncService()
