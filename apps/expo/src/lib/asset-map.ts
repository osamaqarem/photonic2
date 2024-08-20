import type { Asset } from "~/expo/db/schema"

// Filename/asset map
// it's used with Reaniamted so it can't be a `Map`
export type AssetMap = Record<string, Asset>

export function getAssetMap(assets: Array<Asset>): AssetMap {
  let record: Record<string, Asset> = {}
  for (let i = 0; i < assets.length; i++) {
    const item = assets[i]
    if (item) {
      record[item.name] = item
    }
  }
  return record
}
