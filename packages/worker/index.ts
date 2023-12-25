import WorkerModule from "./module"
import type { UploadTask, UploadTaskError } from "./types"

interface UploadAssetsInput {
  assets: Array<UploadTask>
  concurrency: number
}

interface Worker {
  uploadAssets: (
    input: UploadAssetsInput,
    /**
     * @param percentage number between 0 and 100
     */ onProgress: (percentage: number) => void,
  ) => Promise<Array<UploadTaskError>>
}

export const Worker: Worker = {
  uploadAssets: WorkerModule.uploadAssets,
}
