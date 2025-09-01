////
////  temp.swift
////  App
////
////  Created by Filip Tangen on 20/07/2025.
////
//
//import Photos
//import UIKit
//
//// Define a custom error for clarity when an image can't be fetched.
//enum ImageFetchError: Error {
//    case failedToFetch
//}
//
///// Fetches a reference image for a given PHAsset using modern async/await.
///// - Parameter asset: The PHAsset to fetch an image for.
///// - Returns: A UIImage object if successful.
///// - Throws: An error if the image could not be fetched.
//func fetchReferenceImage(for asset: PHAsset) async throws -> UIImage {
//    let manager = PHImageManager.default()
//    let options = PHImageRequestOptions()
//    options.deliveryMode = .highQualityFormat
//    options.isNetworkAccessAllowed = true
//
//    let targetSize = CGSize(width: 800, height: 800)
//
//    // Wrap the completion handler-based API in a continuation.
//    return try await withCheckedThrowingContinuation { continuation in
//        manager.requestImage(
//            for: asset,
//            targetSize: targetSize,
//            contentMode: .aspectFit,
//            options: options
//        ) { image, info in
//            // Check for an error in the info dictionary.
//            if let error = info?[PHImageErrorKey] as? Error {
//                continuation.resume(throwing: error)
//                return
//            }
//            
//            // Ensure the image exists, otherwise throw a custom error.
//            if let image = image {
//                continuation.resume(returning: image)
//            } else {
//                continuation.resume(throwing: ImageFetchError.failedToFetch)
//            }
//        }
//    }
//}
