import { PermissionStatus, usePermissions } from "expo-media-library"
import React from "react"

import { migrate } from "drizzle-orm/expo-sqlite/migrator"
import { mediaManager } from "~/expo/features/home/utils/media-manager"
import { insertPhotosFromDisk } from "~/expo/features/home/utils/sync-manager"
import { db } from "~/expo/lib/db"
import migrations from "~/expo/lib/db/migrations/migrations"
import type { AssetRecordMap, GenericAsset } from "~/expo/lib/db/schema"
import { photos } from "~/expo/lib/db/schema"

type OnData = (d: {
  assetRecords: AssetRecordMap
  assetList: Array<GenericAsset>
}) => void

export const useAssets = (onData: OnData) => {
  const [permissionResponse, requestPermission] = usePermissions()

  React.useEffect(() => {
    const run = async () => {
      // paginator.emitter.on("updated", () => {
      //   const allPages = paginator.pages.flatMap(page => page.data)
      //   onData({
      //     assetRecords: mediaManager.exportRecordMap(allPages),
      //     assetList: allPages,
      //   })
      // })

      if (permissionResponse?.status !== PermissionStatus.GRANTED) {
        requestPermission()
      } else {
        await db.delete(photos)
        await migrate(db, migrations)

        const data = (await db.select().from(photos)) as Array<GenericAsset>

        if (data.length === 0) {
          await insertPhotosFromDisk()
          console.log(data)
        }
        console.log(data.length)

        onData({
          assetRecords: mediaManager.exportRecordMap(data),
          assetList: data,
        })

        // paginator.getNextPage()
        // const sub = mediaManager.addListener(
        //   async ({
        //     hasIncrementalChanges,
        //     deletedAssets,
        //     insertedAssets,
        //     updatedAssets,
        //   }) => {
        //     if (!hasIncrementalChanges) {
        //       console.log("sub: fetchAllAssets")
        //       // TODO: refetch each existing page sequentially
        //     } else {
        //       await paginator.refetchPageFor([
        //         ...(deletedAssets ?? []),
        //         ...(insertedAssets ?? []),
        //         ...(updatedAssets ?? []),
        //       ])
        //     }
        //   },
        // )
        // return sub.remove
      }
    }
    run()
  }, [onData, permissionResponse?.status, requestPermission])
}
