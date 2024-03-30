import { Logger } from "@photonic/common"
import { desc, eq } from "drizzle-orm"
import React from "react"
import { LayoutAnimation } from "react-native"
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
  const [assets, _setAssets] = React.useState<Array<Asset>>([])
  const [ready, setReady] = React.useState(false)

  const { showNotification } = useAlerts()

  const setAssets = React.useCallback((arg: typeof assets) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    _setAssets(arg)
  }, [])

  const load = React.useCallback(async () => {
    const data = await db.select().from(asset).orderBy(desc(asset.creationTime))

    if (data.length > 0) {
      logger.log("Loading existing assets from DB")
      setAssets(data)
      setReady(true)
      return
    }

    const inserted = await populateDB()
    setAssets(inserted)
    setReady(true)
    return
  }, [setAssets])

  React.useEffect(() => {
    load()

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
        logger.log("Received incremental changes", change)

        for (const updated of change.updatedAssets ?? []) {
          if (updated.mediaType !== "photo") continue
          await updateAsset(updated)
        }

        for (const item of change.deletedAssets ?? []) {
          if (item.mediaType !== "photo") continue
          await db.delete(asset).where(eq(asset.localId, item.id))
          console.log("deleted asset after statement")
        }

        if (change.insertedAssets) {
          console.log("does this run?")
          const insertedPhotos = change.insertedAssets.filter(
            t => t.mediaType === "photo",
          )
          if (insertedPhotos.length !== 0) {
            await db.insert(asset).values(insertedPhotos.map(exportAssetInsert))
          }
        }

        // TODO: support incremental changes
        load()
      } else {
        load()
        showNotification({
          message: "Received non-incremental changes.",
          dismissAfterMs: 5000,
        })
      }
    })

    return () => {
      sub.remove()
    }
  }, [load, showNotification])

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
      sortBy: "creationTime",
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
  assets.push(...saved)

  while (data.hasNextPage) {
    data = await fetchMediaLibraryPage(data.endCursor)
    logger.log(`page ${data.assets.length}`, `endCursor: ${data.endCursor}`)
    const saved = await db
      .insert(asset)
      .values(data.assets.map(exportAssetInsert))
      .returning()
    assets.push(...saved)
  }

  logger.log("Populating DB done")
  return assets
}
