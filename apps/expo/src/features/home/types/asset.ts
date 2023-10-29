export interface BaseAsset {
  name: string
  mediaType: "photo" | "video"
  width: number
  height: number
  duration: number
  creationTime: number
}

export interface LocalAsset extends BaseAsset {
  type: "LocalAsset"
  localId: string
  uploadProgressPct: string
  localUri: string
}

export interface RemoteAsset extends BaseAsset {
  type: "RemoteAsset"
  url: string
}

export interface LocalRemoteAsset extends BaseAsset {
  type: "LocalRemoteAsset"
  localId: string
  localUri: string
}

export type GenericAsset = LocalRemoteAsset | RemoteAsset | LocalAsset

// map of asset name to asset
export type AssetRecordMap = Record<string, GenericAsset>
