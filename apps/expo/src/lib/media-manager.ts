import { Logger, assert, invariant } from "@photonic/common"
import * as FileSystem from "expo-file-system"
import * as ExpoMedia from "expo-media-library"
import Share from "react-native-share"
import type { Asset } from "~/expo/db/schema"
import { trpcClient } from "~/expo/state/TrpcProvider"

export { PermissionStatus } from "expo-media-library"

const logger = new Logger("MediaManager")

export type RawLocalAsset = ExpoMedia.Asset

export const mediaManager = {
  MediaType: ExpoMedia.MediaType,
  requestPermissionsAsync: ExpoMedia.requestPermissionsAsync,
  modifyAssetAsync: ExpoMedia.modifyAssetAsync,
  getAssetsAsync: ExpoMedia.getAssetsAsync,
  addListener: ExpoMedia.addListener,
  removeAllListeners: ExpoMedia.removeAllListeners,
  getPermissionsAsync: ExpoMedia.getPermissionsAsync,

  getAssetInfoAsync(asset: Asset) {
    assert(asset.localId)
    return ExpoMedia.getAssetInfoAsync(asset.localId)
  },

  async share(asset: Asset) {
    if (asset.type === "local" || asset.type === "localRemote") {
      const fullInfo = await this.getAssetInfoAsync(asset)
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
  },

  async createAssetAsync(remoteAsset: Asset): Promise<RawLocalAsset> {
    invariant(
      remoteAsset.type === "remote",
      "createAssetAsync: not remoteAsset",
    )
    const destination = FileSystem.cacheDirectory + remoteAsset.name

    // in case file is already in cache
    const info = await FileSystem.getInfoAsync(destination)
    if (!info.exists) {
      logger.log("Downloading file")

      const [firstUrl] = await trpcClient.photo.getSignedUrl.query([
        remoteAsset.name,
      ])
      assert(firstUrl)

      const file = await FileSystem.downloadAsync(firstUrl, destination)
      logger.log("Downloaded file, saving to device")
      return ExpoMedia.createAssetAsync(file.uri)
    }
    logger.log("File already cached, saving to device")
    return ExpoMedia.createAssetAsync(info.uri)
  },

  deleteLocalAssets(assets: Array<Asset>) {
    const uris = assets
      .filter(item => ["local", "localRemote"].includes(item.type))
      .map(item => item.localId as string)
    logger.log("Deleting local assets", uris)
    return ExpoMedia.deleteAssetsAsync(uris)
  },

  async deleteRemoteAssets(
    assets: Array<Asset>,
    type: Array<"remote" | "localRemote">,
  ): Promise<void> {
    if (assets.length === 0) return
    const names = assets
      .filter(item => type.includes(item.type as "remote" | "localRemote"))
      .map(item => item.name)

    try {
      logger.log("Deleting backed up assets", names)
      await trpcClient.photo.delete.mutate({ names })
      logger.log("Done deleting backed up assets")
    } catch (err) {
      throw new Error("deleteAssets: " + err, { cause: err })
    }
  },

  renameRemoteAsset(remoteAsset: Asset, renameTo: string): Promise<void> {
    invariant(
      remoteAsset.type === "remote",
      "renameRemoteAsset: not remoteAsset",
    )
    logger.log(`Renaming object ${remoteAsset.name} to ${renameTo}`)
    return trpcClient.photo.update.mutate({
      id: remoteAsset.id,
      name: remoteAsset.name,
      updatedData: { name: renameTo },
    })
  },
}
