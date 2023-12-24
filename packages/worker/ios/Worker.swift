import ExpoModulesCore
import Photos

public class Worker: Module {
    struct UploadTaskError: Record {
        @Field
        var task: UploadTask?

        @Field
        var error: String?
    }

    struct UploadTask: Record {
        @Field
        var localId: String?

        @Field
        var url: String?

        @Field
        var name: String?
    }

    struct UploadAssetsArg: Record {
        @Field
        var assets: [UploadTask] = []

        @Field
        var concurrency = 10
    }

    func getUploadTaskError(task: UploadTask?, error: String) -> UploadTaskError {
        let t = UploadTaskError()
        t.task = task
        t.error = error
        return t
    }


    public func definition() -> ModuleDefinition {
        Name("Worker")

        Events("onComplete", "onProgress")

        AsyncFunction("uploadAssets") { (input: UploadAssetsArg) async -> [UploadTaskError?] in
            let ids = input.assets.compactMap { $0.localId }

            let options = PHFetchOptions()
            options.sortDescriptors = [NSSortDescriptor.init(key: "creationDate", ascending: false)]
            let fetchedAssets = PHAsset.fetchAssets(withLocalIdentifiers: ids, options: options)

            if(fetchedAssets.count == 0) {
                return []
            }

            var errors: [UploadTaskError?] = []

            return await withTaskGroup(of: UploadTaskError?.self, returning: [UploadTaskError?].self) { group in
                for i in 0...fetchedAssets.count - 1 {
                    if i >= input.concurrency {
                        while let err = await group.next() {
                            errors.append(err)
                        }
                    }

                    group.addTask(priority: .background) {
                        return await withCheckedContinuation { [unowned self] (continuation: CheckedContinuation<UploadTaskError?, Never>) in
                            let asset = fetchedAssets[i]
                            let task = input.assets.first { $0.localId == asset.localIdentifier }

                            guard let unwrapped = task else {
                                let err = self.getUploadTaskError(task: nil, error: "PHAsset with no matching localId")
                                continuation.resume(returning: err)
                                return
                            }

                            self.uploadAsset(asset: asset, task: unwrapped) { err in
                                continuation.resume(returning: err)
                                return
                            }
                        }
                    }
                }

                return errors
            }
        }
    }

    private func uploadAsset(asset: PHAsset, task: UploadTask, completion: @escaping (UploadTaskError?) -> Void) {
        if(asset.mediaType != PHAssetMediaType.image) {
            completion(getUploadTaskError(task: task, error: "Media type was not image"))
            return
        }

        let options = PHImageRequestOptions()
        options.isNetworkAccessAllowed = true
        options.isSynchronous = true
        options.deliveryMode = .highQualityFormat
        options.version = .current

        PHImageManager.default().requestImageDataAndOrientation(for: asset, options: options) { [unowned self] data, _, _, _ in
            guard let url = URL(string: task.url ?? "") else {
                completion(getUploadTaskError(task: task, error: "Could not instantiate URL"))
                return
            }

            var request = URLRequest(url: url)
            request.httpMethod = "PUT"
            request.addValue("application/octet-stream", forHTTPHeaderField: "content-type")

            // TODO: Multipart upload via chunks and file streaming
            URLSession.shared.uploadTask(with: request, from: data) { [unowned self] data, res, err in
                if err != nil {
                    let msg = err?.localizedDescription ?? "Upload task resolved with unknown error"
                    completion(getUploadTaskError(task: task, error: msg))
                    return
                }
            }.resume()
        }
    }
}
