//
//  UploadService.swift
//  photonic
//
//  Created by Osama Qarem on 21/08/2022.
//

import Photos


// packages/upload-service/types.ts -> AssetUploadTask
typealias AssetUploadTask = NSMutableDictionary
// packages/upload-service/types.ts -> UploadEvent
typealias UploadEvent = NSMutableDictionary

extension NSMutableDictionary: @unchecked Sendable { }

@objc(UploadService)
class UploadService: RCTEventEmitter {
    var eventDataList: [UploadEvent] = []

    override func supportedEvents() -> [String]! {
        return ["onProgress", "onComplete"]
    }

    func mutateUploadTaskToUploadEvent(item: AssetUploadTask, percent: String? = "0", error: String? = nil) -> UploadEvent {
        item.setValue(percent, forKey: "percent")
        item.setValue(error, forKey: "error")
        return item
    }

    func onProgress(_ eventData: UploadEvent) {
        self.eventDataList.append(eventData)
    }

    func sendEventOnProgress() {
        if(self.eventDataList.count > 0) {
            self.sendEvent(withName: "onProgress", body: self.eventDataList)
            self.eventDataList = []
        }
    }

    func sendEventOnComplete() {
        self.sendEvent(withName: "onComplete", body: nil)
    }

    @objc
    func uploadAssets(_ data: [AssetUploadTask]) {
        Task {
            await uploadAssetsAsync(data)
        }
    }

    func uploadAssetsAsync(_ data: [AssetUploadTask]) async -> Void {
        var identifiers: [String] = []
        for item in data {
            identifiers.append(item.value(forKey: "localIdentifier") as! String)
        }

        let options = PHFetchOptions()
        options.sortDescriptors = [NSSortDescriptor.init(key: "creationDate", ascending: false)]
        let fetchedAssets = PHAsset.fetchAssets(withLocalIdentifiers: identifiers, options: options)

        if(fetchedAssets.count == 0) {
            self.sendEventOnComplete()
            return
        }

        let timer = Timer.scheduledTimer(withTimeInterval: 0.4, repeats: true, block: { _ in
            self.sendEventOnProgress()
        })

        await withTaskGroup(of: Void.self) { group -> Void in
            let concurrency = 5

            for i in 0...fetchedAssets.count - 1 {
                if i >= concurrency {
                    await group.next()
                }

                group.addTask(priority: .background) {
                    await withCheckedContinuation { [unowned self] continuation in
                        let phAsset = fetchedAssets[i]

                        let dataItem = data.first(where:
                            { $0.value(forKey: "localIdentifier") as! String == phAsset.localIdentifier }
                        )

                        guard let dataItem = dataItem else {
                            let event = self.mutateUploadTaskToUploadEvent(
                                item: NSMutableDictionary.init(),
                                error: "🍎 UploadService: withCheckedContinuation -> did not find item for matching asset: \(phAsset.localIdentifier)")
                            self.onProgress(event)

                            continuation.resume()
                            return
                        }

                        self.uploadImage(asset: phAsset, item: dataItem) {
                            continuation.resume()
                        }
                    }
                }
            }
        }

        timer.invalidate()
        self.sendEventOnProgress()
        self.sendEventOnComplete()
    }

    func uploadImage(asset: PHAsset, item: AssetUploadTask, completion: @escaping () -> Void) {
        let urlString = item.value(forKey: "uploadUrl") as? String ?? ""
        guard let url = URL(string: urlString) else {
            let event = self.mutateUploadTaskToUploadEvent(
                item: item,
                error: "🍎 UploadService: uploadImage -> Invalid URL.")
            self.onProgress(event)
            completion()
            return
        }

        if (asset.mediaType == PHAssetMediaType.video) {
            let event = self.mutateUploadTaskToUploadEvent(
                item: item,
                error: "🍎 UploadService: uploadImage -> asset type is video which is not supported yet.")
            self.onProgress(event)
            completion()
            return
        }

        let options = PHImageRequestOptions()
        options.isNetworkAccessAllowed = true
        options.isSynchronous = true

        PHImageManager.default().requestImageDataAndOrientation(for: asset, options: options) { [unowned self] data, dataUti, _, _ in
            guard let data = data else {
                let event = self.mutateUploadTaskToUploadEvent(
                    item: item,
                    error: "🍎 UploadService: requestImageDataAndOrientation -> data is nil.")
                self.onProgress(event)
                completion()
                return
            }

            let utiString = dataUti ?? "public.data"
            let utType = UTType(utiString)
            var mimeType: String
            if let utType = utType {
                mimeType = utType.preferredMIMEType ?? "application/octet-stream"
            } else {
                mimeType = "application/octet-stream"
            }

            var request = URLRequest(url: url)
            request.httpMethod = "PUT"
            request.addValue(mimeType, forHTTPHeaderField: "Content-Type")
            URLSession.shared.uploadTask(with: request, from: data) { data, response, err in
                if err != nil {
                    let event = self.mutateUploadTaskToUploadEvent(
                        item: item,
                        percent: "0",
                        error: "🍎 UploadService: uploadTask -> data is nil.")
                    self.onProgress(event)
                    completion()
                    return
                }

                let event = self.mutateUploadTaskToUploadEvent(
                    item: item,
                    percent: "100")
                self.onProgress(event)
                completion()
                return
            }.resume()

            // TODO: Multipart upload via chunks and file streaming
            // TODO: file chunking via streaming
            // TODO: upload progress
//            asset.requestContentEditingInput(with: PHContentEditingInputRequestOptions()) { (input, _) in
//                guard let url = input?.fullSizeImageURL else {
//                    let error = UploadEvent(error: "🍎 UploadService: requestContentEditingInput -> fullSizeImageURL is nil")
//                    self.sendEventOnProgress(error)
//                    completion()
//                    return
//                }
//            }
        }
    }
}
