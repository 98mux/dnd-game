//
//  AnalyseImage.swift
//  App
//
//  Created by Filip Tangen on 19/07/2025.
//
import CoreVideo
import CoreML
import UIKit
import AVFoundation
import SwiftUI

class AnalyseImage{
    
    
    /// Hold reference to zero-shot predictor
    var modelConfiguration = defaultModel
    var zsclassifier = ZSImageClassification(model: defaultModel.factory())

    /// Prompt and classnames related
    private var prompt = presets[0].prompt
    private var textEmbeddings: [MLMultiArray] = []

    /// Inference timing, see also inferenceTimeExponentialMovingAverageWindow
    private var inferenceTime: CFTimeInterval = 0

    /// stream of frames -> VideoFrameView, see distributeVideoFrames
    private var framesToDisplay: AsyncStream<CVImageBuffer>?

    /// Controls the info popover
    private var showingInfo = false

    /// Shows spinner / prevents double submit
    private var loading = false
    
    func analyse(title: String, message: String) {
        // Alert code
    }
    
    func analyseImageUI(image:UIImage) async-> Optional<[(className: String, similarity: Float)]>{

         guard let buffer = pixelBuffer(from:image) else
         {
             fatalError("Failed to convert to pixel buffer")

         }
         
         return await self.performZeroShotClassification(buffer)
        
    }
    
    func analyseImage(imageName:String) async-> Optional<[(className: String, similarity: Float)]>{
        guard let image = UIImage(named: imageName) else {
            fatalError("Image not found in Assets.")
        }
        
         guard let buffer = pixelBuffer(from:image) else
         {
             fatalError("Failed to convert to pixel buffer")

         }
         
         return await self.performZeroShotClassification(buffer)
        
    }
    func analyseImageFromPixelBuffer(buffer:CVPixelBuffer) async-> Optional<[(className: String, similarity: Float)]>{
        return await self.performZeroShotClassification(buffer)
    }
    
    func analyseImageFromPath(path:String) async -> Optional<[(className: String, similarity: Float)]>{
        // 1. Convert file path to URL (works for "file://" or raw path)
            let fileURL: URL
            if path.starts(with: "file://") {
                fileURL = URL(string: path)!
            } else {
                fileURL = URL(fileURLWithPath: path)
            }
        
        guard let imageData = try? Data(contentsOf: fileURL),
              let image = UIImage(data: imageData) else {
            print("Path", path)
            print("Failed to load image")
            return nil
        }
        
         guard let buffer = pixelBuffer(from:image) else
         {
             print("Failed to turn into pixel buffer")
            return nil

         }
         
         return await self.performZeroShotClassification(buffer)
        
    }
    
//    func analyseBase64Image(_ imageBase64:String) async{
//        guard let image = UIImage(named: imageName) else {
//            fatalError("Image not found in Assets.")
//        }
//        
//         guard let buffer = pixelBuffer(from:image) else
//         {
//             fatalError("Failed to convert to pixel buffer")
//
//         }
//         
//         await self.performZeroShotClassification(buffer)
//        
//    }
    
    
     func setModel(_ model: ModelConfiguration) async {
        await self.zsclassifier.setModel(model)
         do{
             await rebuildEmbeddings()
         }
         catch{}
    }

     func rebuildEmbeddings() async {
        await self.setPrompt(self.prompt)
    }
    
    

    /// Construct prompt and text embeddings
     func setPrompt(_ prompt: Prompt) async {
        if loading {
            // if the model isn't loaded yet someone might try and submit
            // multiple times -- it can take a few seconds to load
            return
        }

        self.loading = true
        do {
            // wait for both the text and image model to be ready, otherwise
            // we may remove the spinner before we can actually start inference
            await zsclassifier.load()
            textEmbeddings = await zsclassifier.computeTextEmbeddings(
                promptArr: prompt.fullPrompts())
            self.prompt = prompt
            self.loading = false
        }
         catch{
             
         }
    }

    
    
    func performZeroShotClassification(_ frame: CVPixelBuffer) async -> Optional<[(className: String, similarity: Float)]> {
        if prompt.classNames.isEmpty {
            //displayPredictions = []
        } else {
            guard let output = await zsclassifier.computeImageEmbeddings(frame: frame) else {
                return nil
            }

            let imageEmbedding = output.embedding
           // observeTiming(output.interval)
            
//            zip(textEmbeddings, prompt.classNames)
//                .forEach { (textEmbedding, className) in
//                    let similarity = zsclassifier.cosineSimilarity(imageEmbedding, textEmbedding)
//                    print("\(className): \(similarity)")
//                }
            let result = zip(textEmbeddings, prompt.classNames)
                .map { (textEmbedding, className) -> (className: String, similarity: Float) in
                    let similarity = zsclassifier.cosineSimilarity(imageEmbedding, textEmbedding)
                    return (className, similarity)
                }
                .sorted { $0.similarity > $1.similarity } // Sort descending
            
//                result.forEach { (className, similarity) in
//                    print("\(className): \(similarity)")
//                }
//            print("END ANALYZING")
            
            return result

           /* self.displayPredictions = zip(textEmbeddings, prompt.classNames)
                .map { (textEmbedding, className) in
                    let similarity = zsclassifier.cosineSimilarity(imageEmbedding, textEmbedding)
                    return DisplayPrediction(className: className, cosineSimilarity: similarity)
                }*/
        }
        return nil
    }
}

