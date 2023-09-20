import type { AssetUploadTask } from "."

export interface UploadEvent extends AssetUploadTask {
  percent: string
  error: Maybe<string>
}

export const enum UploadEvents {
  onComplete = "onComplete",
  onProgress = "onProgress",
}
