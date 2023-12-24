export interface UploadTask {
  name: string
  localId: string
  url: string
}

export interface UploadTaskError {
  task: UploadTask
  error: string
}

export const enum UploadEvents {
  onProgress = "onProgress",
}
