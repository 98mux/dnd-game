////
////  PhotoConverter.swift
////  App
////
////  Created by Filip Tangen on 20/07/2025.
////
//
//import UIKit
//import Photos
//import VideoToolbox
//
///// A custom error type for photo conversion operations.
//enum PhotoConverterError: Error, LocalizedError {
//    case unauthorized
//    case noImagesConverted
//
//    var errorDescription: String? {
//        switch self {
//        case .unauthorized:
//            return "Photo library access was not authorized."
//        case .noImagesConverted:
//            return "Failed to convert any images to CVPixelBuffer."
//        }
//    }
//}
//
////import Photos
////
////func fetchReferenceImage(for asset: PHAsset, completion: @escaping (UIImage?) -> Void) {
////    let manager = PHImageManager.default()
////    let options = PHImageRequestOptions()
////    options.deliveryMode = .highQualityFormat // Ensure you get a good quality version
////    options.isNetworkAccessAllowed = true // Allow fetching from iCloud if needed
////
////    // Request a reasonably sized image, not the full original.
////    let targetSize = CGSize(width: 800, height: 800)
////
////    manager.requestImage(for: asset,
////                          targetSize: targetSize,
////                          contentMode: .aspectFit, // Use .aspectFit to see the whole object
////                          options: options) { image, _ in
////        completion(image)
////    }
////}
//
///// A utility class to fetch recent photos and convert them to CVPixelBuffer using modern async/await.
//class PhotoConverter {
//
//    // MARK: - Public API
//
//    /**
//     Fetches the 10 most recent images from the photo library and converts them to CVPixelBuffer.
//     This function uses modern async/await syntax.
//
//     - Returns: An array of `CVPixelBuffer` objects.
//     - Throws: A `PhotoConverterError` if authorization fails or no images can be converted.
//    */
//    public func getRecentPhotosAsPixelBuffers() async throws -> [CVPixelBuffer] {
//        // First, check for photo library authorization.
//        let isAuthorized = await checkPhotoLibraryPermission()
//        guard isAuthorized else {
//            throw PhotoConverterError.unauthorized
//        }
//
//        // Fetch the most recent 10 image assets.
//        let fetchOptions = PHFetchOptions()
//        fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
//        fetchOptions.fetchLimit = 10
//        let fetchResult = PHAsset.fetchAssets(with: .image, options: fetchOptions)
//
//        var assets: [PHAsset] = []
//        fetchResult.enumerateObjects { asset, _, _ in
//            assets.append(asset)
//        }
//
//        guard !assets.isEmpty else {
//            return []
//        }
//        
//        // Use a TaskGroup to process images concurrently for better performance.
//        let pixelBuffers: [CVPixelBuffer] = await withTaskGroup(of: CVPixelBuffer?.self, returning: [CVPixelBuffer].self) { group in
//            let imageManager = PHImageManager.default()
//            let targetSize = UIScreen.main.bounds.size
//
//            for asset in assets {
//                group.addTask {
//                    guard let image = await self.requestImage(for: asset, with: imageManager, targetSize: targetSize) else {
//                        return nil
//                    }
//                    // The conversion itself is a synchronous operation.
//                    return self.pixelBuffer(from: image)
//                }
//            }
//
//            // Collect all non-nil results from the group.
//            var results: [CVPixelBuffer] = []
//            for await buffer in group {
//                if let buffer = buffer {
//                    results.append(buffer)
//                }
//            }
//            return results
//        }
//
//        // If we started with assets but ended with no buffers, something went wrong.
//        if pixelBuffers.isEmpty && !assets.isEmpty {
//            throw PhotoConverterError.noImagesConverted
//        }
//
//        return pixelBuffers
//    }
//
//    // MARK: - Private Helper Functions
//
//    /**
//     Asynchronously checks the current authorization status for the photo library.
//     
//     - Returns: A boolean indicating if access is granted.
//    */
//    private func checkPhotoLibraryPermission() async -> Bool {
//        let status = PHPhotoLibrary.authorizationStatus()
//        switch status {
//        case .authorized, .limited:
//            return true
//        case .denied, .restricted:
//            return false
//        case .notDetermined:
//            // Asynchronously request permission if it hasn't been determined yet.
//            return await withCheckedContinuation { continuation in
//                PHPhotoLibrary.requestAuthorization { newStatus in
//                    continuation.resume(returning: newStatus == .authorized || newStatus == .limited)
//                }
//            }
//        @unknown default:
//            return false
//        }
//    }
//    
//    /**
//     Asynchronously requests a UIImage for a given PHAsset.
//
//     - Parameters:
//       - asset: The `PHAsset` to fetch an image for.
//       - manager: The `PHImageManager` to use for the request.
//       - targetSize: The desired size of the requested image.
//     - Returns: An optional `UIImage`.
//    */
//    private func requestImage(for asset: PHAsset, with manager: PHImageManager, targetSize: CGSize) async -> UIImage? {
//        await withCheckedContinuation { continuation in
//            let options = PHImageRequestOptions()
//            options.deliveryMode = .highQualityFormat
//            options.isNetworkAccessAllowed = true // Allow fetching from iCloud Photos
//            
//            manager.requestImage(for: asset, targetSize: targetSize, contentMode: .aspectFit, options: options) { image, _ in
//                continuation.resume(returning: image)
//            }
//        }
//    }
//
//    /**
//     Converts a UIImage object into a CVPixelBuffer. (This function is synchronous and remains unchanged).
//
//     - Parameter image: The `UIImage` to convert.
//     - Returns: An optional `CVPixelBuffer` containing the image data.
//    */
//    private func pixelBuffer(from image: UIImage) -> CVPixelBuffer? {
//        // Ensure the UIImage has a CGImage representation.
//        guard let cgImage = image.cgImage else {
//            print("Error: Could not get CGImage from UIImage.")
//            return nil
//        }
//
//        let width = cgImage.width
//        let height = cgImage.height
//
//        // Define the attributes for the pixel buffer.
//        let options: [String: Any] = [
//            kCVPixelBufferCGImageCompatibilityKey as String: true,
//            kCVPixelBufferCGBitmapContextCompatibilityKey as String: true,
//            kCVPixelBufferIOSurfacePropertiesKey as String: [:]
//        ]
//
//        var pixelBuffer: CVPixelBuffer?
//        // Create the CVPixelBuffer.
//        let status = CVPixelBufferCreate(kCFAllocatorDefault,
//                                          width,
//                                          height,
//                                          kCVPixelFormatType_32ARGB,
//                                          options as CFDictionary,
//                                          &pixelBuffer)
//
//        guard status == kCVReturnSuccess, let unwrappedPixelBuffer = pixelBuffer else {
//            print("Error: Failed to create CVPixelBuffer. Status: \(status)")
//            return nil
//        }
//
//        // Lock the base address of the pixel buffer for writing.
//        CVPixelBufferLockBaseAddress(unwrappedPixelBuffer, CVPixelBufferLockFlags(rawValue: 0))
//        let pixelData = CVPixelBufferGetBaseAddress(unwrappedPixelBuffer)
//
//        // Create a Core Graphics context to draw the image into the pixel buffer.
//        let rgbColorSpace = CGColorSpaceCreateDeviceRGB()
//        guard let context = CGContext(data: pixelData,
//                                      width: width,
//                                      height: height,
//                                      bitsPerComponent: 8,
//                                      bytesPerRow: CVPixelBufferGetBytesPerRow(unwrappedPixelBuffer),
//                                      space: rgbColorSpace,
//                                      bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)
//        else {
//            print("Error: Could not create CGContext.")
//            CVPixelBufferUnlockBaseAddress(unwrappedPixelBuffer, CVPixelBufferLockFlags(rawValue: 0))
//            return nil
//        }
//
//        // Draw the image into the context.
//        context.translateBy(x: 0, y: CGFloat(height))
//        context.scaleBy(x: 1.0, y: -1.0)
//        context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
//
//        // Unlock the base address.
//        CVPixelBufferUnlockBaseAddress(unwrappedPixelBuffer, CVPixelBufferLockFlags(rawValue: 0))
//
//        return unwrappedPixelBuffer
//    }
//}
//
//// MARK: - Example Usage
//
///*
// // To use this class, you would do the following in your ViewController or other relevant class:
//
// let photoConverter = PhotoConverter()
//
// Task {
//     do {
//         let pixelBuffers = try await photoConverter.getRecentPhotosAsPixelBuffers()
//         print("Successfully fetched and converted \(pixelBuffers.count) images.")
//         // You can now use the array of CVPixelBuffer objects.
//         // For example, print the dimensions of the first one:
//         if let firstBuffer = pixelBuffers.first {
//             let width = CVPixelBufferGetWidth(firstBuffer)
//             let height = CVPixelBufferGetHeight(firstBuffer)
//             print("First pixel buffer dimensions: \(width)x\(height)")
//         }
//     } catch {
//         print("An error occurred: \(error.localizedDescription)")
//     }
// }
//
//*/
