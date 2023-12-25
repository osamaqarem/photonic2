import ExpoModulesCore
import Photos

public class Worker: Module {
    struct UploadTaskError: Record {
        @Field
        var task: UploadTask?

        @Field
        var error: String
    }

    struct UploadTask: Record {
        @Field
        var localId: String

        @Field
        var url: String

        @Field
        var name: String
    }

    struct UploadAssetsArg: Record {
        @Field
        var assets: [UploadTask]

        @Field
        var concurrency: Int
    }

    actor UploadState {
        var total: Int
        var count = 0
        var fractionCompleted: Double { Double(count) / Double(total) }
        var errors: [UploadTaskError?] = []

        init(total: Int) {
            self.total = total
        }

        func addProgress() -> Double {
            count += 1
            return fractionCompleted
        }

        func addError(e: UploadTaskError?) {
            errors.append(e)
        }
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

        AsyncFunction("uploadAssets") { (input: UploadAssetsArg, onProgress: JavaScriptFunction<Void>) async -> [Record.Dict] in
            let ids = input.assets.compactMap { $0.localId }

            let options = PHFetchOptions()
            options.sortDescriptors = [NSSortDescriptor.init(key: "creationDate", ascending: false)]
            let fetchedAssets = PHAsset.fetchAssets(withLocalIdentifiers: ids, options: options)

            if(fetchedAssets.count == 0) {
                return []
            }


            let uploadState = UploadState(total: fetchedAssets.count)


            let groupErrors = await withTaskGroup(of: UploadTaskError?.self, returning: [UploadTaskError?].self) { group in
                for i in 0...fetchedAssets.count - 1 {
                    if i >= input.concurrency {
                        _ = await group.next()
                    }

                    group.addTask(priority: .background) {
                        let child = await withCheckedContinuation { [unowned self] (continuation: CheckedContinuation<UploadTaskError?, Never>) in
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

                        let completed = await uploadState.addProgress()
                        let progress = completed * Double(100)
                        try? onProgress.call(Int(progress.rounded(.down)))
                        await uploadState.addError(e: child)

                        return child
                    }
                }

                var items: [UploadTaskError?] = []
                for await result in group {
                    items.append(result)
                }
                return items
            }

            return groupErrors.compactMap { $0?.toDictionary() }

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
            guard let url = URL(string: task.url) else {
                completion(getUploadTaskError(task: task, error: "Could not instantiate URL"))
                return
            }

            var request = URLRequest(url: url)
            request.httpMethod = "PUT"
            request.addValue("application/octet-stream", forHTTPHeaderField: "content-type")

            // TODO: Multipart upload via chunks and file streaming for files > 5 MB
            URLSession.shared.uploadTask(with: request, from: data) { [unowned self] data, res, err in
                if err != nil {
                    let msg = err?.localizedDescription ?? "Upload task resolved with unknown error"
                    completion(getUploadTaskError(task: task, error: msg))
                    return
                }
                completion(nil)
            }.resume()
        }
    }
}
