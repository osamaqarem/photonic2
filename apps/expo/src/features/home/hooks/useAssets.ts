import { Logger } from "@photonic/common"
import * as ExpoMedia from "expo-media-library"
import React from "react"
import type { GenericAsset } from "~/expo/features/home/utils/media-manager"
import { exportPhotoSchemaObject } from "~/expo/features/home/utils/media-manager"
import { db } from "~/expo/lib/db"
import { assets } from "~/expo/lib/db/schema"
import { storage } from "~/expo/lib/storage"

const logger = new Logger("useAssets")

const DatabasePopulatedKey = "DatabasePopulatedKey"
const databasePopulatedStorage = {
  get: () => storage.getBoolean(DatabasePopulatedKey),
  save: () => storage.set(DatabasePopulatedKey, true),
}

export const useAssets = () => {
  const [photoDbState, setPhotoDbState] = React.useState<
    "building" | "permissionNeeded" | "ready"
  >()
  const [data, setData] = React.useState<Array<GenericAsset>>()

  React.useEffect(() => {
    const init = async () => {
      const fetchAssets = async () => {
        const data = await db.select().from(assets)
        setPhotoDbState("ready")
        setData(data as Array<GenericAsset>)
        logger.log("assets length: " + data.length)
      }

      if (!photoDbState || photoDbState === "permissionNeeded") {
        const res = await ExpoMedia.getPermissionsAsync()
        if (res.granted) {
          const databasePopulated = databasePopulatedStorage.get()
          if (!databasePopulated) {
            setPhotoDbState("building")
            populateDB()
          }
          fetchAssets()
        } else {
          setPhotoDbState("permissionNeeded")
        }
      }
    }
    init()
  }, [photoDbState])

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
  await db.insert(assets).values(data.assets.map(exportPhotoSchemaObject))
  while (data.hasNextPage) {
    data = await fetchMediaLibraryPage(data.endCursor)
    await db.insert(assets).values(data.assets.map(exportPhotoSchemaObject))
  }
  databasePopulatedStorage.save()
  logger.log("Populating DB done")
}
