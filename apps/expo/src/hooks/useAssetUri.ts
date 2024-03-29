import { assert } from "@photonic/common"
import React from "react"
import type { Asset } from "~/expo/lib/db/schema"
import { trpcClient } from "~/expo/stores/TrpcProvider"

export function useAssetUri(asset: Asset) {
  const [uri, setUri] = React.useState(
    asset.type !== "remote" ? (asset.uri as string) : undefined,
  )

  React.useEffect(() => {
    if (!uri) {
      trpcClient.photo.getSignedUrl.query([asset.name]).then(([url]) => {
        assert(url)
        setUri(url)
      })
    }
  }, [asset.name, uri])

  return uri
}
