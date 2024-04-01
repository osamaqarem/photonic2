export interface UploadTask {
  id: string
  localId: string
  name: string
  url: string
}

export interface UploadTaskError {
  task: UploadTask
  error: string
}

export const enum UploadEvents {
  onProgress = "onProgress",
}
