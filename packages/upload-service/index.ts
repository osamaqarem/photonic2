import { NativeEventEmitter, NativeModules } from "react-native"

import type { UploadEvent } from "./types"
import { UploadEvents } from "./types"

export type AssetUploadTask = {
  localIdentifier: string // rename to localId
  name: string // rename to externalId
  uploadUrl: string
}

const emitter = new NativeEventEmitter(NativeModules.UploadService)

export const UploadService = {
  uploadAssets(
    data: Array<AssetUploadTask>,
    onProgress: (updatedItems: Array<UploadEvent>) => void,
    onComplete?: () => void,
  ): void {
    const emitter1 = emitter.addListener(UploadEvents.onProgress, onProgress)
    const emitter2 = emitter.addListener(UploadEvents.onComplete, () => {
      emitter1.remove()
      emitter2.remove()
      onComplete?.()
    })

    NativeModules.UploadService.uploadAssets(data)
  },
}
