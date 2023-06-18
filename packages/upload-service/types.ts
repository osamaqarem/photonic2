import { AssetUploadTask } from "@photonic/expo/src/features/photo/list/types/asset"

export interface UploadEvent extends AssetUploadTask {
  percent: string
  error: Maybe<string>
}

export const enum UploadEvents {
  onComplete = "onComplete",
  onProgress = "onProgress",
}
