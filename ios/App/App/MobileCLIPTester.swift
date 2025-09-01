//
//  MobileCLIPTester.swift
//  App
//
//  Created by Filip Tangen on 19/07/2025.
//

import UIKit
import CoreML
import Vision

struct MobileCLIPTester {
    // 1. Load the S2 models (using YOUR exact class names)
    private let imageModel = try! MobileCLIP_S2_Image(configuration: .init())
    private let textModel = try! MobileCLIP_S2_Text(configuration: .init())
    
    // 2. Test function
    func testImage(_ image: UIImage, textQuery: String) -> String {
        // Convert UIImage to 224x224 CVPixelBuffer (S2 requirement)
        guard let pixelBuffer = image.pixelBuffer(width: 224, height: 224) else {
            return "⚠️ Failed to convert image to 224x224 pixel buffer"
        }
        
        // 3. Image encoding
        let imageInput = MobileCLIP_S2_ImageInput(image: pixelBuffer)
        guard let imageOutput = try? imageModel.prediction(input: imageInput) else {
            return "⚠️ Image encoding failed"
        }
        
        // 4. Text encoding
        let textInput = MobileCLIP_S2_TextInput(text: textQuery)
        guard let textOutput = try? textModel.prediction(input: textInput) else {
            return "⚠️ Text encoding failed"
        }
        
        // 5. Calculate normalized similarity
        let similarity = cosineSimilarity(
            imageOutput.image_embeddings,
            textOutput.text_embeddings
        )
        
        return """
        ✅ MobileCLIP-S2 Results (224x224)
        Query: '\(textQuery)'
        Similarity: \(String(format: "%.3f", similarity))
        \(similarity >= 0.3 ? "🎯 High match!" : "❌ Low match")
        """
    }
    
    // Proper cosine similarity calculation
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
