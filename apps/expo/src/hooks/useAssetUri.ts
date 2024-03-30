import { assert } from "@photonic/common"
import React from "react"
import type { Asset } from "~/expo/lib/db/schema"
import { trpcClient } from "~/expo/stores/TrpcProvider"

const getUri = (asset: Asset) =>
  asset.type !== "remote" ? (asset.uri as string) : undefined

export function useAssetUri(asset: Asset) {
  const [uri, setUri] = React.useState(getUri(asset))
  const lastItemId = React.useRef(asset.id)

  // flashlist recycling support
  // https://shopify.github.io/flash-list/docs/recycling
  if (asset.id !== lastItemId.current) {
    lastItemId.current = asset.id
    setUri(getUri(asset))
  }

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
