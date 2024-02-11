import { Logger } from "@photonic/common"
import * as FileSystem from "expo-file-system"
import * as ExpoMedia from "expo-media-library"
import Share from "react-native-share"

import type { Asset, AssetInsert } from "~/expo/lib/db/schema"
import { trpcClient } from "~/expo/stores/TrpcProvider"

export type LocalMediaAsset = ExpoMedia.Asset

export type LocalAsset = Asset & {
  type: "local"
  localId: string
  uri: string
}

export type RemoteAsset = Omit<Asset, "localId" | "uri"> & {
  type: "remote"
  url: string
}

export type LocalRemoteAsset = Asset & {
  type: "localRemote"
  localId: string
  uri: string
}

export type GenericAsset = LocalAsset | RemoteAsset | LocalRemoteAsset

// asset name hashmap
export type AssetRecordMap = Record<string, GenericAsset>

class MediaManager {
  private logger = new Logger("MediaManager")

  PermissionStatus = ExpoMedia.PermissionStatus

  MediaType = ExpoMedia.MediaType

  requestPermissionsAsync = ExpoMedia.requestPermissionsAsync

  getPermissionsAsync = ExpoMedia.getPermissionsAsync

  modifyAssetAsync = ExpoMedia.modifyAssetAsync

  getAssetsAsync = ExpoMedia.getAssetsAsync

  addListener = ExpoMedia.addListener

  removeAllListeners = ExpoMedia.removeAllListeners

  getAssetInfoAsync(asset: LocalAsset | LocalRemoteAsset) {
    return ExpoMedia.getAssetInfoAsync(asset.localId)
  }

  async share(asset: GenericAsset) {
    if (asset.type === "local" || asset.type === "localRemote") {
      const fullInfo = await this.getAssetInfoAsync(asset)
      return Share.open({ url: fullInfo.localUri })
    } else {
      const downloaded = await FileSystem.downloadAsync(
        asset.url,
        FileSystem.cacheDirectory + asset.name,
      )
      return Share.open({ url: downloaded.uri })
    }
  }

  async createAssetAsync(remoteAsset: RemoteAsset) {
    type Result = Promise<LocalMediaAsset>

    const destination = FileSystem.cacheDirectory + remoteAsset.name
    // in case file is already in cache
    const info = await FileSystem.getInfoAsync(destination)
    if (!info.exists) {
      this.logger.log("Downloading file")
      const file = await FileSystem.downloadAsync(remoteAsset.url, destination)
      this.logger.log("Downloaded file, saving to device")
      return ExpoMedia.createAssetAsync(file.uri) as Result
    }
    this.logger.log("File already cached, saving to device")
    return ExpoMedia.createAssetAsync(info.uri) as Result
  }

  deleteAssetsAsync(assets: Array<LocalAsset | LocalRemoteAsset>) {
    const uris = assets.map(item => item.localId)
    this.logger.log("Deleting local assets", uris)
    return ExpoMedia.deleteAssetsAsync(uris)
  }

  async deleteRemoteAssets(
    assets: Array<LocalRemoteAsset | RemoteAsset>,
  ): Promise<void> {
    if (assets.length === 0) return
    const names = assets.map(item => item.name)
    this.logger.log("Deleting backed up assets", names)
    try {
      await trpcClient.photo.delete.mutate({ names })
      this.logger.log("Done deleting backed up assets")
    } catch (err) {
      throw new Error("deleteAssets: " + err, { cause: err })
    }
  }

  renameRemoteAsset(remoteAsset: RemoteAsset, renameTo: string): Promise<void> {
    this.logger.log(`Renaming object ${remoteAsset.name} to ${renameTo}`)
    return trpcClient.photo.update.mutate({
      id: remoteAsset.id,
      name: remoteAsset.name,
      updatedData: { name: renameTo },
    })
  }

  getRemoteUrl(assets: Array<RemoteAsset | LocalRemoteAsset>) {
    return trpcClient.photo.getSignedUrl.query(assets.map(item => item.name))
  }
}

export const mediaManager = new MediaManager()

export function exportRecordMap(assets?: Array<GenericAsset>): AssetRecordMap {
  "worklet"
  if (!assets) return {}

  let record: Record<string, GenericAsset> = {}
  for (let i = 0; i < assets.length; i++) {
    const item = assets[i]
    if (item) {
      record[item.name] = item
    }
  }
  return record
}

export function exportPhotoSchemaObject(
  expoAsset: LocalMediaAsset,
): AssetInsert {
  return {
    localId: expoAsset.id,
    name: expoAsset.filename,
    type: "local",
    mediaType: expoAsset.mediaType as "photo" | "video",
    width: expoAsset.width,
    height: expoAsset.height,
    uri: expoAsset.uri,
    duration: expoAsset.duration,
    creationTime: new Date(expoAsset.creationTime),
  }
}
