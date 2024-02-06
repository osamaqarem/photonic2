import { mediaManager } from "~/expo/features/home/utils/media-manager"
import { db } from "~/expo/lib/db"
import type { BaseAsset } from "~/expo/lib/db/schema"
import { photos } from "~/expo/lib/db/schema"

export async function insertPhotosFromDisk() {
  console.log("inserting data")
  const data = await mediaManager.getAssetsAsync({
    mediaType: [
      mediaManager.MediaType.photo,
      // TODO: ExpoMedia.MediaType.video
    ],
  })

  const items = data.assets.map(
    asset =>
      ({
        localId: asset.id,
        name: asset.filename,
        type: "local",
        mediaType: asset.mediaType as "photo" | "video",
        width: asset.width,
        height: asset.height,
        uri: asset.uri,
        duration: asset.duration,
        creationTime: new Date(asset.creationTime),
      } satisfies Omit<BaseAsset, "id">),
  )

  await db.insert(photos).values(items)
}
