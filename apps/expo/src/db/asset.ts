import { assert } from "@photonic/common"
import type { AssetInsert } from "~/expo/db/schema"
import type { RawLocalAsset } from "~/expo/lib/media-manager"
import { deviceIdStorage } from "~/expo/lib/storage"
import { useAuth } from "~/expo/state/auth-store"
import type { trpcClient } from "~/expo/state/TrpcProvider"

type RawRemoteAsset = Awaited<
  ReturnType<typeof trpcClient.photo.list.query>
>["assets"][number]

export function getSchemaForRawRemoteAsset(
  rawRemoteAsset: RawRemoteAsset,
): AssetInsert {
  return {
    deviceId: rawRemoteAsset.deviceId,
    localId: null,
    name: rawRemoteAsset.name,
    type: "remote",
    mediaType: rawRemoteAsset.mediaType as "photo" | "video",
    width: rawRemoteAsset.width,
    height: rawRemoteAsset.height,
    duration: rawRemoteAsset.duration,
    uri: null,
    creationTime: parseInt(rawRemoteAsset.creationTime, 10),
    modificationTime: parseInt(rawRemoteAsset.modificationTime, 10),
    userId: rawRemoteAsset.userId,
  }
}

export function getSchemaForRawLocalAsset(
  rawAsset: RawLocalAsset,
): AssetInsert {
  const deviceId = deviceIdStorage.get()
  const { user } = useAuth.getState()
  assert(user?.id)

  return {
    localId: rawAsset.id,
    name: rawAsset.filename,
    type: "local",
    mediaType: rawAsset.mediaType as "photo" | "video",
    width: rawAsset.width,
    height: rawAsset.height,
    uri: rawAsset.uri,
    duration: rawAsset.duration,
    creationTime: rawAsset.creationTime,
    modificationTime: rawAsset.modificationTime,
    userId: user.id,
    deviceId,
  }
}
