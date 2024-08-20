import { assert, invariant, Logger } from "@photonic/common"
import * as FileSystem from "expo-file-system"
import * as ExpoMedia from "expo-media-library"
import Share from "react-native-share"
import type { Asset } from "~/expo/db/schema"
import { trpcClient } from "~/expo/providers/TrpcProvider"

export type RawLocalAsset = ExpoMedia.Asset

class MediaService {
  logger = new Logger("MediaService")

  MediaType = ExpoMedia.MediaType
  PermissionStatus = ExpoMedia.PermissionStatus

  getAssetsAsync = ExpoMedia.getAssetsAsync
  modifyAssetAsync = ExpoMedia.modifyAssetAsync

  getAssetInfoAsync(asset: Asset) {
    assert(asset.localId)
    return ExpoMedia.getAssetInfoAsync(asset.localId)
  }

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
  }

  async createAssetAsync(remoteAsset: Asset): Promise<RawLocalAsset> {
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

  deleteLocalAssets(assets: Array<Asset>) {
    const uris = assets
      .filter(item => ["local", "localRemote"].includes(item.type))
      .map(item => item.localId as string)
    this.logger.log("Deleting local assets", uris)
    return ExpoMedia.deleteAssetsAsync(uris)
  }

  async deleteRemoteAssets(
    assets: Array<Asset>,
    type: Array<"remote" | "localRemote">,
  ): Promise<void> {
    if (assets.length === 0) return
    const names = assets
      .filter(item => type.includes(item.type as "remote" | "localRemote"))
      .map(item => item.name)
    this.logger.log("Deleting backed up assets", names)
    await trpcClient.photo.delete.mutate({ names })
    this.logger.log("Done deleting backed up assets")
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
