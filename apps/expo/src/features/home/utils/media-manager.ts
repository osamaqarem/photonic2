import { Logger, assert, invariant } from "@photonic/common"
import * as FileSystem from "expo-file-system"
import * as ExpoMedia from "expo-media-library"
import Share from "react-native-share"
import type { AssetInsert, Asset } from "~/expo/lib/db/schema"
import { deviceIdStorage } from "~/expo/lib/device-id"
import { trpcClient } from "~/expo/stores/TrpcProvider"
import { useAuth } from "~/expo/stores/auth-store"

export { PermissionStatus } from "expo-media-library"

class MediaManager {
  private logger = new Logger("MediaManager")

  public permissionStatus: ExpoMedia.PermissionStatus =
    ExpoMedia.PermissionStatus.UNDETERMINED

  MediaType = ExpoMedia.MediaType

  requestPermissionsAsync = ExpoMedia.requestPermissionsAsync

  modifyAssetAsync = ExpoMedia.modifyAssetAsync

  getAssetsAsync = ExpoMedia.getAssetsAsync

  addListener = ExpoMedia.addListener

  removeAllListeners = ExpoMedia.removeAllListeners

  getAssetInfoAsync(asset: Asset) {
    assert(asset.localId)
    return ExpoMedia.getAssetInfoAsync(asset.localId)
  }

  async getPermissionsAsync() {
    const res = await ExpoMedia.getPermissionsAsync()
    this.permissionStatus = res.status
    return res
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

  async createAssetAsync(remoteAsset: Asset): Promise<LocalMediaAsset> {
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
      .filter(item => item.type === "local" || item.type === "localRemote")
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
      .filter(item => type.some(t => t === item.type))
      .map(item => item.name as string)

    try {
      this.logger.log("Deleting backed up assets", names)
      await trpcClient.photo.delete.mutate({ names })
      this.logger.log("Done deleting backed up assets")
    } catch (err) {
      throw new Error("deleteAssets: " + err, { cause: err })
    }
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

export const mediaManager = new MediaManager()

export function exportAssetRecordMap(assets?: Array<Asset>): AssetRecordMap {
  "worklet"
  if (!assets) return {}
  let record: Record<string, Asset> = {}
  for (let i = 0; i < assets.length; i++) {
    const item = assets[i]
    if (item) {
      record[item.name] = item
    }
  }
  return record
}

export function exportAssetInsert(expoAsset: LocalMediaAsset): AssetInsert {
  const deviceId = deviceIdStorage.get()
  const { userId } = useAuth.getState()
  assert(deviceId)
  assert(userId)

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
    deviceId,
    userId,
  }
}

export function usePermissions() {
  const [permissionResponse, requestPermission] = ExpoMedia.usePermissions()
  if (permissionResponse?.status) {
    mediaManager.permissionStatus = permissionResponse.status
  }
  return [permissionResponse, requestPermission] as const
}

export type LocalMediaAsset = ExpoMedia.Asset

// asset name hashmap
export type AssetRecordMap = Record<string, Asset>
