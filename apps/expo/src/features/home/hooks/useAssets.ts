import { Logger } from "@photonic/common"
import { eq } from "drizzle-orm"
import React from "react"
import { useAlerts } from "~/expo/design/components/alerts/useAlerts"
import type { LocalMediaAsset } from "~/expo/features/home/utils/media-manager"
import {
  exportAssetInsert,
  mediaManager,
} from "~/expo/features/home/utils/media-manager"
import { db } from "~/expo/lib/db"
import type { Asset } from "~/expo/lib/db/schema"
import { asset } from "~/expo/lib/db/schema"

const logger = new Logger("useAssets")

export const useAssets = () => {
  const [assets, setAssets] = React.useState<Array<Asset>>([])
  const [ready, setReady] = React.useState(false)

  const { showNotification } = useAlerts()

  React.useEffect(() => {
    const init = async () => {
      const data = await db.select().from(asset)
      if (data.length > 0) {
        setAssets(data)
        setReady(true)
        return
      }

      const inserted = await populateDB()
      setAssets(inserted)
      setReady(true)
      return
    }
    init()
  }, [])

  React.useEffect(() => {
    const updateAsset = async (item: LocalMediaAsset) => {
      if (item.mediaType !== "photo") return
      await db
        .update(asset)
        .set({
          creationTime: new Date(item.creationTime),
          duration: item.duration,
          height: item.height,
          width: item.width,
          localId: item.id,
          name: item.filename,
          uri: item.uri,
        })
        .where(eq(asset.name, item.filename))
    }

    const sub = mediaManager.addListener(async change => {
      if (change.hasIncrementalChanges) {
        for (const updated of change.updatedAssets ?? []) {
          await updateAsset(updated)
        }
        for (const item of change.deletedAssets ?? []) {
          await db.delete(asset).where(eq(asset.name, item.filename))
        }
        if (change.insertedAssets) {
          await db
            .insert(asset)
            .values(change.insertedAssets.map(exportAssetInsert))
        }
      } else {
        // TODO: rebuild DB of local assets
        showNotification({
          message: "Received non-incremental changes.",
          dismissAfterMs: 5000,
        })
      }
    })

    return () => {
      sub.remove()
    }
  }, [showNotification])

  if (!ready) {
    return { assets, loading: true }
  }

  return { assets, loading: false }
}

async function populateDB() {
  const fetchMediaLibraryPage = (after?: string) => {
    return mediaManager.getAssetsAsync({
      after,
      first: 2000,
      mediaType: [
        mediaManager.MediaType.photo,
        // TODO: ExpoMedia.MediaType.video
      ],
    })
  }
  logger.log("Populating DB")
  const assets: Array<Asset> = []

  let data = await fetchMediaLibraryPage()
  const saved = await db
    .insert(asset)
    .values(data.assets.map(exportAssetInsert))
    .returning()
  assets.concat(saved)

  while (data.hasNextPage) {
    data = await fetchMediaLibraryPage(data.endCursor)
    const saved = await db
      .insert(asset)
      .values(data.assets.map(exportAssetInsert))
      .returning()
    assets.concat(saved)
  }

  logger.log("Populating DB done")
  return assets
}
