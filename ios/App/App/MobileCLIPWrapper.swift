//
//  MobileCLIPWrapper.swift
//  App
//
//  Created by Filip Tangen on 19/07/2025.
//

import UIKit
import CoreML

struct MobileCLIPWrapper {
    // Models
    private let imageModel: MobileCLIP_S2_Image
    private let textModel: MobileCLIP_S2_Text
    
    init() throws {
        self.imageModel = try MobileCLIP_S2_Image()
        self.textModel = try MobileCLIP_S2_Text()
    }
    
    func analyze(image: UIImage, textQuery: String) throws -> (similarity: Float, debugInfo: String) {
        // Convert image
        guard let pixelBuffer = image.pixelBuffer(width: 224, height: 224) else {
            throw AnalysisError.imageConversionFailed
        }
        
        // Run predictions
        let imageInput = MobileCLIP_S2_ImageInput(image: pixelBuffer)
        let textInput = MobileCLIP_S2_TextInput(text: textQuery)
        
        let imageOutput = try imageModel.prediction(input: imageInput)
        let textOutput = try textModel.prediction(input: textInput)
        
        // Calculate similarity
        let similarity = cosineSimilarity(imageOutput.image_embeddings,
                                        textOutput.text_embeddings)
        
        let debugInfo = """
        🔍 Analysis Results
        Image size: \(image.size)
        Query: \"\(textQuery)\"
        Similarity: \(String(format: "%.3f", similarity))
        Device: \(UIDevice.current.model)
        iOS: \(UIDevice.current.systemVersion)
        """
        
        return (similarity, debugInfo)
    }
    
    private func cosineSimilarity(_ a: MLMultiArray, _ b: MLMultiArray) -> Float {
        var dot: Float = 0, normA: Float = 0, normB: Float = 0
        for i in 0..<a.count {
            dot += a[i].floatValue * b[i].floatValue
            normA += pow(a[i].floatValue, 2)
            normB += pow(b[i].floatValue, 2)
        }
        return dot / (sqrt(normA) * sqrt(normB) + 1e-8)
    }
}

enum AnalysisError: Error {
    case imageConversionFailed
}

// MARK: - UIImage Extension
extension UIImage {
    func pixelBuffer(width: Int, height: Int) -> CVPixelBuffer? {
        var pixelBuffer: CVPixelBuffer?
        let attrs = [
            kCVPixelBufferCGImageCompatibilityKey: kCFBooleanTrue,
            kCVPixelBufferCGBitmapContextCompatibilityKey: kCFBooleanTrue
        ] as CFDictionary
        
        CVPixelBufferCreate(
            kCFAllocatorDefault,
            width,
            height,
            kCVPixelFormatType_32ARGB,
            attrs,
            &pixelBuffer
        )
        
        guard let buffer = pixelBuffer else { return nil }
        
        CVPixelBufferLockBaseAddress(buffer, [])
        defer { CVPixelBufferUnlockBaseAddress(buffer, []) }
        
        let context = CGContext(
            data: CVPixelBufferGetBaseAddress(buffer),
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        )
        
        guard let cgImage = self.cgImage else { return nil }
        context?.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        
        return buffer
    }
}
