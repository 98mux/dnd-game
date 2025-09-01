//
//  MyPlugin2.swift
//  App
//
//  Created by Filip Tangen on 19/07/2025.
//

import Foundation
import UIKit
import Capacitor
import QuartzCore
import Photos


public struct ImageResult{
    let result:[(className: String, similarity: Float)]
    let metadata: PhotoMetadata
    func toDict() -> [String: Any] {
        return [
            "result": result.map { ["className": $0.className, "similarity": $0.similarity] },
            "metadata": metadata.toDict()
        ]
    }
}

public class BridgeImplementation: NSObject {
    
  let imageAnalyzer = AnalyseImage()

  public func getCurrentOrientationType() -> String {
    let currentOrientation: UIDeviceOrientation = UIDevice.current.orientation
    return fromDeviceOrientationToOrientationType(currentOrientation)
  }
    
    public func prompts(prompts: [String]) async {
        let prompt = Prompt(prefix: "Feels",
                            suffix: "",
                            classNames: prompts)
        await imageAnalyzer.setPrompt(prompt);
    }
    func getTotalImageCount() async -> Int {
        let fetchOptions = PHFetchOptions()
        fetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.image.rawValue)

        let fetchResult = PHAsset.fetchAssets(with: fetchOptions)
        return fetchResult.count
    }
    
    public func analyseImages(batchSize: Int, offset: Int) async -> [ImageResult] {
//        let photoConverter = PhotoConverter()
        var allResults: [ImageResult] = []
        var startTime = CACurrentMediaTime()

        do{
            var images = await fetchLatestCameraRollImagesWithMetadata(count:batchSize, offset:offset)
            print("Successfully fetched and converted \(images.count) images.")
            var endTime = CACurrentMediaTime()
                        
            print("Fetched images \(endTime - startTime) seconds ⏱️")


            startTime = CACurrentMediaTime()

            
            // Initialize an empty array to hold the analysis results for all images.
            
            // Loop through each CVPixelBuffer in the array.
            for image in images {
                // Await the analysis for the current buffer.
                // Note: The original function call used a 'path' argument.
                // I am assuming the analyzer function should take the 'buffer' directly.
                // Please adjust the line below if your function signature is different.
                let rawImage = image.image
                guard let safeImage = rawImage else { continue }
                
                let result = await imageAnalyzer.analyseImageUI(image: safeImage)
                
                var strippedMetadata = image
                strippedMetadata.image = nil
                // Add the result of the analysis to our array of all results.
                allResults.append(ImageResult(result:result!, metadata: strippedMetadata))
            }
            
            endTime = CACurrentMediaTime() 
            print("Analyzed images \(endTime - startTime) seconds ⏱️")


        }
        catch{
            return []
        }

        return allResults
    }

//    func deletePhoto(with identifier: String) async {
//        let assets = PHAsset.fetchAssets(withLocalIdentifiers: [identifier], options: nil)
//        
//        guard let asset = assets.firstObject else {
//            print("Asset not found for identifier: \(identifier)")
//            return
//        }
//
//        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
//            PHPhotoLibrary.shared().performChanges({
//                PHAssetChangeRequest.deleteAssets([asset] as NSArray)
//            }, completionHandler: { success, error in
//                if let error = error {
//                    print("Error deleting photo: \(error.localizedDescription)")
//                } else if success {
//                    print("Photo deleted successfully.")
//                } else {
//                    print("Unknown error occurred during deletion.")
//                }
//                continuation.resume()
//            })
//        }
//    }
//    func deletePhoto(with identifier: String) async -> Bool {
//        let assets = PHAsset.fetchAssets(withLocalIdentifiers: [identifier], options: nil)
//        
//        guard let asset = assets.firstObject else {
//            print("Asset not found for identifier: \(identifier)")
//            return false
//        }
//
//        return await withCheckedContinuation { continuation in
//            PHPhotoLibrary.shared().performChanges({
//                PHAssetChangeRequest.deleteAssets([asset] as NSArray)
//            }, completionHandler: { success, error in
//                if let error = error {
//                    print("Error deleting photo: \(error.localizedDescription)")
//                    continuation.resume(returning: false)
//                } else {
//                    print(success ? "Photo deleted successfully." : "Unknown error occurred during deletion.")
//                    continuation.resume(returning: success)
//                }
//            })
//        }
//    }
    
    func deletePhotos(with identifiers: [String]) async -> Bool {
        let assets = PHAsset.fetchAssets(withLocalIdentifiers: identifiers, options: nil)

        if assets.count == 0 {
            print("No assets found for the provided identifiers.")
            return false
        }

        return await withCheckedContinuation { continuation in
            PHPhotoLibrary.shared().performChanges({
                PHAssetChangeRequest.deleteAssets(assets)
            }, completionHandler: { success, error in
                if let error = error {
                    print("Error deleting photos: \(error.localizedDescription)")
                    continuation.resume(returning: false)
                } else {
                    print(success ? "Photos deleted successfully." : "Unknown error occurred during deletion.")
                    continuation.resume(returning: success)
                }
            })
        }
    }
    
    


    public func requestPhotoLibraryAccess() async -> [String: Any] {
        let accessLevel: PHAccessLevel = .readWrite

        let status = await PHPhotoLibrary.requestAuthorization(for: accessLevel)
        let isLimited = PHPhotoLibrary.authorizationStatus(for: accessLevel) == .limited

        var photoCount = 0
        if status == .authorized || status == .limited {
            let fetchOptions = PHFetchOptions()
            let fetchResult = PHAsset.fetchAssets(with: .image, options: fetchOptions)
            photoCount = fetchResult.count
        }

        return [
               "authorizationStatus": status.rawValue, // 3 = authorized, 4 = limited
               "isLimited": isLimited,
               "photoCount": photoCount
           ]
    }
    
   
    public struct ThumbnailResult {
        let identifier: String
        let base64: String
        let width: Int
        let height: Int
    }

    public func getThumbnailsBase64(for identifiers: [String]) async -> [ThumbnailResult] {
        var results: [ThumbnailResult] = []

        for id in identifiers {
            let assets = PHAsset.fetchAssets(withLocalIdentifiers: [id], options: nil)
            guard let asset = assets.firstObject else { continue }

            if let result = await getResizedThumbnail(for: asset) {
                results.append(result)
            }
        }

        return results
    }

    private func getResizedThumbnail(for asset: PHAsset) async -> ThumbnailResult? {
        return await withCheckedContinuation { continuation in
            let imageManager = PHImageManager.default()
            let options = PHImageRequestOptions()
            options.isSynchronous = false
            options.deliveryMode = .highQualityFormat

            // Calculate target size with min dimension = 100px, preserve aspect ratio
            let originalWidth = CGFloat(asset.pixelWidth)
            let originalHeight = CGFloat(asset.pixelHeight)
            let scale = 100.0 / min(originalWidth, originalHeight)
            let targetSize = CGSize(width: originalWidth * scale, height: originalHeight * scale)

            imageManager.requestImage(for: asset, targetSize: targetSize, contentMode: .aspectFit, options: options) { image, _ in
                guard let image = image,
                      let imageData = image.jpegData(compressionQuality: 0.7) else {
                    continuation.resume(returning: nil)
                    return
                }

                let base64 = imageData.base64EncodedString()
                let result = ThumbnailResult(
                    identifier: asset.localIdentifier,
                    base64: base64,
                    width: Int(image.size.width),
                    height: Int(image.size.height)
                )
                continuation.resume(returning: result)
            }
        }
    }
    
    public func analyseImage(path: String) async -> Optional<[(className: String, similarity: Float)]>  {
        
//        let thumbnail = getThumbnailURL(forLocalIdentifier: , targetSize: <#T##CGSize#>, completion: <#T##(URL?) -> Void#>)
                let result = await imageAnalyzer.analyseImageFromPath(path:path)
                return result
    }

    public func echo(path: String) async -> Optional<[(className: String, similarity: Float)]>  {
                let result = await imageAnalyzer.analyseImageFromPath(path:path)
                return result
    }
  private func fromDeviceOrientationToOrientationType(_ orientation: UIDeviceOrientation) -> String {
    switch orientation {
    case .landscapeLeft:
      return "landscape-primary"
    case .landscapeRight:
      return "landscape-secondary"
    case .portraitUpsideDown:
      return "portrait-secondary"
    default:
      // Case: portrait
      return "portrait-primary"
    }
  }

}
