import { assert, invariant, Logger } from "@photonic/common"
import * as FileSystem from "expo-file-system"
import * as ExpoMedia from "expo-media-library"
import Share from "react-native-share"
import { assetRepo, getSchemaForRawLocalAsset } from "~/expo/db/asset-repo"
import { type Asset } from "~/expo/db/schema"
import { lastSyncTimeStorage } from "~/expo/lib/storage"
import { trpcClient } from "~/expo/providers/TrpcProvider"

export type RawLocalAsset = ExpoMedia.Asset

class MediaService {
  logger = new Logger("MediaService")

  MediaType = ExpoMedia.MediaType
  PermissionStatus = ExpoMedia.PermissionStatus

  modifyAssetAsync = ExpoMedia.modifyAssetAsync

  getAssetInfo(asset: Asset) {
    assert(asset.localId)
    return ExpoMedia.getAssetInfoAsync(asset.localId)
  }

  fetchMediaLibraryPage(after?: string) {
    return ExpoMedia.getAssetsAsync({
      after,
      first: Number.MAX_SAFE_INTEGER,
      sortBy: "creationTime",
      mediaType: [this.MediaType.photo],
    })
  }

  async getLocalAssets(reset = false) {
    if (reset) {
      await assetRepo.drop()
      lastSyncTimeStorage.delete()
    }

    this.logger.log("Populating DB")
    let assets: Array<Asset> = []
    let cursor
    do {
      const data = await this.fetchMediaLibraryPage(cursor)
      this.logger.log(`page ${data.assets.length}`, `endCursor: ${cursor}`)
      const saved = await assetRepo.update(
        data.assets.map(getSchemaForRawLocalAsset),
        ["type", "uri"],
      )
      assets = assets.concat(saved)
      cursor = data.hasNextPage ? data.endCursor : null
    } while (cursor)
    this.logger.log("Populating DB done")
    return assets
  }

  async share(asset: Asset) {
    if (asset.type === "local" || asset.type === "localRemote") {
      const fullInfo = await this.getAssetInfo(asset)
      return Share.open({ url: fullInfo.localUri })
    } else {
      const [firstUrl] = await trpcClient.photo.getSignedUrl.query([asset.name])
      assert(firstUrl)
      const downloaded = await FileSystem.downloadAsync(
        firstUrl,
        FileSystem.cacheDirectory + asset.name,
      )
      return Share.open({ url: downloaded.uri })
    }
  }

  async createAsset(remoteAsset: Asset): Promise<RawLocalAsset> {
    invariant(
      remoteAsset.type === "remote",
      "createAssetAsync: not remoteAsset",
    )
    const destination = FileSystem.cacheDirectory + remoteAsset.name

    // in case file is already in cache
    const info = await FileSystem.getInfoAsync(destination)
    if (!info.exists) {
      this.logger.log("Downloading file")

      const [firstUrl] = await trpcClient.photo.getSignedUrl.query([
        remoteAsset.name,
      ])
      assert(firstUrl)

      const file = await FileSystem.downloadAsync(firstUrl, destination)
      this.logger.log("Downloaded file, saving to device")
      return ExpoMedia.createAssetAsync(file.uri)
    }
    this.logger.log("File already cached, saving to device")
    return ExpoMedia.createAssetAsync(info.uri)
  }

  async deleteAssets(
    items: Array<Asset>,
    types = ["local", "remote", "localRemote"],
  ) {
    const localFilter: Array<Asset["type"]> = types.filter(
      t => t === "local" || t === "localRemote",
    )
    const remoteFilter: Array<Asset["type"]> = types.filter(t => t === "remote")

    const local = items
      .filter(item => localFilter.includes(item.type))
      .map(item => item.localId as string)
    const remote = items
      .filter(item => remoteFilter.includes(item.type))
      .map(item => item.name)

    await Promise.all([
      ExpoMedia.deleteAssetsAsync(local),
      trpcClient.photo.delete.mutate({ names: remote }),
      assetRepo.delete(items),
    ])
  }

  async saveRemoteAsset(selectedRemoteAsset: Asset) {
    invariant(
      selectedRemoteAsset.type === "remote",
      "saveRemoteAsset: not remote asset",
    )

    // `renameRemoteAsset` causes `updatedAt` to be refreshed for the remote asset, so the next remote sync will reconcile the state for this asset
    const savedAsset = await this.createAsset(selectedRemoteAsset)
    const creationTime = selectedRemoteAsset.creationTime

    await this.modifyAssetAsync(savedAsset, {
      creationTime,
    })

    await this.renameRemoteAsset(selectedRemoteAsset, savedAsset.filename)

    return assetRepo.update([
      {
        id: savedAsset.id,
        localId: savedAsset.id,
        name: savedAsset.filename,
        type: "localRemote",
        mediaType: "photo",
        width: savedAsset.width,
        height: savedAsset.height,
        duration: savedAsset.duration,
        creationTime: savedAsset.creationTime,
        modificationTime: savedAsset.modificationTime,
        uri: savedAsset.uri,
        deviceId: selectedRemoteAsset.deviceId,
        userId: selectedRemoteAsset.userId,
      },
    ])
  }

  renameRemoteAsset(remoteAsset: Asset, renameTo: string): Promise<void> {
    invariant(
      remoteAsset.type === "remote",
      "renameRemoteAsset: not remoteAsset",
    )
    this.logger.log(`Renaming object ${remoteAsset.name} to ${renameTo}`)
    return trpcClient.photo.update.mutate({
      id: remoteAsset.id,
      name: remoteAsset.name,
      updatedData: { name: renameTo },
    })
  }
}

export const mediaService = new MediaService()
