import React from "react"

import type {
  AssetRecordMap,
  GenericAsset,
} from "~/expo/features/home/types/asset"
import { mediaManager } from "~/expo/features/home/utils/media-manager"

const fetchLocalAssets = async () => {
  const raw = await mediaManager.getAssetsAsync({
    first: Infinity,
    mediaType: [
      mediaManager.MediaType.photo,
      // TODO: ExpoMedia.MediaType.video
    ],
  })
  return raw.assets.map(mediaManager.exportLocalAsset)
}

type OnData = (d: {
  assetRecords: AssetRecordMap
  assetList: Array<GenericAsset>
}) => void

export const useAssets = (onData: OnData) => {
  const fetchAllAssets = React.useCallback(async () => {
    fetchLocalAssets().then(data => {
      onData({
        assetRecords: mediaManager.exportRecordMap(data),
        assetList: mediaManager.sortByDate(data),
      })
    })
  }, [onData])

  React.useEffect(() => {
    fetchAllAssets()

    const sub = mediaManager.addListener(({ hasIncrementalChanges }) => {
      if (!hasIncrementalChanges) {
        console.log("sub: fetchAllAssets")
        return fetchAllAssets()
      } else {
        console.log("sub: incremental changes, fetchAllAssets")
        // TODO: incremental changes
        return fetchAllAssets()
      }
    })
    return sub.remove

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
