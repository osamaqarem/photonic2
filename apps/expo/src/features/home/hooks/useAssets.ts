import { Logger } from "@photonic/common"
import { eq } from "drizzle-orm"
import * as ExpoMedia from "expo-media-library"
import React from "react"
import { useAlerts } from "~/expo/design/components/alerts/useAlerts"
import type {
  GenericAsset,
  LocalMediaAsset,
} from "~/expo/features/home/utils/media-manager"
import { exportPhotoSchemaObject } from "~/expo/features/home/utils/media-manager"
import { db } from "~/expo/lib/db"
import { asset } from "~/expo/lib/db/schema"
import { storage } from "~/expo/lib/storage"

const logger = new Logger("useAssets")

const DatabasePopulatedKey = "DatabasePopulatedKey"
const databasePopulatedStorage = {
  get: () => storage.getBoolean(DatabasePopulatedKey),
  save: () => storage.set(DatabasePopulatedKey, true),
}

export const useAssets = () => {
  const [photoDbState, setPhotoDbState] = React.useState<
    "building" | "permissionNeeded" | "permissionGranted" | "ready"
  >()
  const [data, setData] = React.useState<Array<GenericAsset>>()
  const { showNotification } = useAlerts()

  React.useEffect(() => {
    const init = async () => {
      if (!photoDbState) {
        const res = await ExpoMedia.getPermissionsAsync()
        if (res.granted) {
          setPhotoDbState("permissionGranted")
        } else {
          setPhotoDbState("permissionNeeded")
        }
      } else if (photoDbState === "permissionGranted") {
        const databasePopulated = databasePopulatedStorage.get()
        if (!databasePopulated) {
          setPhotoDbState("building")
          populateDB()
        }
        const data = await db.select().from(asset)
        setData(data as Array<GenericAsset>)
        setPhotoDbState("ready")
      }
    }
    init()
  }, [photoDbState])

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

    const sub = ExpoMedia.addListener(async change => {
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
            .values(change.insertedAssets.map(exportPhotoSchemaObject))
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

  console.log(data?.[0]?.id)
  return { assets: data, photoDbState }
}

function fetchMediaLibraryPage(after?: string) {
  return ExpoMedia.getAssetsAsync({
    after,
    first: 2000,
    mediaType: [
      ExpoMedia.MediaType.photo,
      // TODO: ExpoMedia.MediaType.video
    ],
  })
}

async function populateDB() {
  logger.log("Populating DB")
  let data = await fetchMediaLibraryPage()
  await db.insert(asset).values(data.assets.map(exportPhotoSchemaObject))
  while (data.hasNextPage) {
    data = await fetchMediaLibraryPage(data.endCursor)
    await db.insert(asset).values(data.assets.map(exportPhotoSchemaObject))
  }
  databasePopulatedStorage.save()
  logger.log("Populating DB done")
}
