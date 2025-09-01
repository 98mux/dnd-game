//
//  thumbnail.swift
//  App
//
//  Created by Filip Tangen on 20/07/2025.
//

import Photos
import UIKit
import CoreLocation

enum ImageFetchError: Error {
    case failedToFetch
}

/// Fetches a 256x256 reference image for MobileCLIP, cropping to the center if necessary.
/// - Parameter asset: The PHAsset to fetch an image for.
/// - Returns: A 256x256 UIImage object if successful.
/// - Throws: An error if the image could not be fetched.
func fetchMobileClipReferenceImage(for asset: PHAsset) async throws -> UIImage {
    let manager = PHImageManager.default()
    let options = PHImageRequestOptions()
    options.deliveryMode = .highQualityFormat
    options.isNetworkAccessAllowed = true
    options.resizeMode = .exact

    let targetSize = CGSize(width: 256, height: 256)

    return try await withCheckedThrowingContinuation { continuation in
        manager.requestImage(
            for: asset,
            targetSize: targetSize,
            // Change to .aspectFill to crop the image to fill the square.
            contentMode: .aspectFill,
            options: options
        ) { image, info in
            if let error = info?[PHImageErrorKey] as? Error {
                continuation.resume(throwing: error)
                return
            }
            
            if let image = image {
                continuation.resume(returning: image)
            } else {
                continuation.resume(throwing: ImageFetchError.failedToFetch)
            }
        }
    }
}


//func fetchLatestCameraRollImages(count: Int, offset:Int) async -> [UIImage] {
//    let fetchOptions = PHFetchOptions()
//    // Sort by creation date, most recent first.
//    fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
//    // Limit the number of photos fetched.
//    fetchOptions.fetchLimit = count
//
//    // Find all image assets that match the options.
//    let fetchResult = PHAsset.fetchAssets(with: .image, options: fetchOptions)
//    
//    guard fetchResult.count > 0 else {
//        // No images found, throw an error.
//        return []
////        throw ImageFetchError.noAssetsFound
//    }
//
//    var images: [UIImage] = []
//    // Pre-allocate capacity for better performance.
//    images.reserveCapacity(fetchResult.count)
//
//    // Loop through the fetched assets and get the image for each one.
//    for i in 0..<fetchResult.count {
//        let asset = fetchResult.object(at: i)
//        if let image = try? await fetchMobileClipReferenceImage(for: asset) {
//            images.append(image)
//        }
//    }
//    
//    return images
//}


func fetchLatestCameraRollImages(count: Int, offset: Int) async -> [UIImage] {
    let fetchOptions = PHFetchOptions()
    fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]

    let allAssets = PHAsset.fetchAssets(with: .image, options: fetchOptions)
    let range = offset..<min(offset + count, allAssets.count)

    guard range.lowerBound < allAssets.count else {
        return []
    }

    let assets = allAssets.objects(at: IndexSet(integersIn: range))

    var images: [UIImage] = []
    images.reserveCapacity(assets.count)

    for asset in assets {
        if let image = try? await fetchMobileClipReferenceImage(for: asset) {
            images.append(image)
        }
    }

    return images
}
extension Date {
    var iso8601String: String {
        ISO8601DateFormatter().string(from: self)
    }
}
extension CLLocation {
    var coordinateDict: [String: Double] {
        ["latitude": coordinate.latitude, "longitude": coordinate.longitude]
    }
}
struct PhotoMetadata {
    var image: Optional<UIImage>
    let identifier: String
    let creationDate: Date?
    let location: CLLocation?
    let pixelWidth: Int
    let pixelHeight: Int
    let mediaType: PHAssetMediaType
    func toDict() -> [String: Any] {
        return [
            "identifier": identifier,
            "creationDate": creationDate?.iso8601String ?? "",
            "location": location?.coordinateDict ?? [:],
            "pixelWidth": pixelWidth,
            "pixelHeight": pixelHeight,
            "mediaType": mediaType.rawValue
        ]
    }
}

func fetchLatestCameraRollImagesWithMetadata(count: Int, offset: Int) async -> [PhotoMetadata] {
    let fetchOptions = PHFetchOptions()
    fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]

    let allAssets = PHAsset.fetchAssets(with: .image, options: fetchOptions)
    let range = offset..<min(offset + count, allAssets.count)

    guard range.lowerBound < allAssets.count else {
        return []
    }

    let assets = allAssets.objects(at: IndexSet(integersIn: range))
    var results: [PhotoMetadata] = []
    results.reserveCapacity(assets.count)

    for asset in assets {
        if let image = try? await fetchMobileClipReferenceImage(for: asset) {
            let metadata = PhotoMetadata(
                image: image,
                identifier: asset.localIdentifier,
                creationDate: asset.creationDate,
                location: asset.location,
                pixelWidth: asset.pixelWidth,
                pixelHeight: asset.pixelHeight,
                mediaType: asset.mediaType
            )
            results.append(metadata)
        }
    }

    return results
}
