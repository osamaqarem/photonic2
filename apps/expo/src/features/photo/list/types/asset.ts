/**
 * An asset that is present either only locally, only remotely, or both.
 */
export interface BaseAsset {
  name: string // rename to externalId
  mediaType: "photo" | "video"
  width: number
  height: number
  duration: number
  creationTime: number
}

export interface LocalAsset extends BaseAsset {
  type: "LocalAsset"
  localIdentifier: string // rename to localId
  uploadProgressPct: string
  localUri: string
}

export interface RemoteAsset extends BaseAsset {
  type: "RemoteAsset"
  url: string
}

export interface LocalRemoteAsset extends BaseAsset {
  type: "LocalRemoteAsset"
  localIdentifier: string
  localUri: string
}

export type GenericAsset = LocalRemoteAsset | RemoteAsset | LocalAsset

export type AssetUploadTask = Pick<LocalAsset, "localIdentifier" | "name"> & {
  uploadUrl: string
}
