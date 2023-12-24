import WorkerModule from "./module"
import type { UploadTask, UploadTaskError } from "./types"

interface Worker {
  uploadAssets: (input: {
    assets: Array<UploadTask>
    concurrency: number
  }) => Promise<Array<UploadTaskError>>
}

export const Worker: Worker = {
  uploadAssets: WorkerModule.uploadAssets,
}
