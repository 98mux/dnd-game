//
//  ImageToPixelBuffer.swift
//  App
//
//  Created by Filip Tangen on 19/07/2025.
//



import UIKit
import CoreVideo

func pixelBuffer(from image: UIImage) -> CVPixelBuffer? {
    // 1. Set image dimensions (must match model input size)
    let width = image.size.width
    let height = image.size.height
    
    // 2. Create a dictionary to specify pixel buffer options
    let attrs = [
        kCVPixelBufferCGImageCompatibilityKey: kCFBooleanTrue,
        kCVPixelBufferCGBitmapContextCompatibilityKey: kCFBooleanTrue
    ] as CFDictionary
    
    var pixelBuffer: CVPixelBuffer?
    
    // 3. Create the pixel buffer
    let status = CVPixelBufferCreate(
        kCFAllocatorDefault,
        Int(width),
        Int(height),
        kCVPixelFormatType_32ARGB, // or kCVPixelFormatType_32BGRA
        attrs,
        &pixelBuffer
    )
    
    guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
        return nil
    }
    
    // 4. Lock the buffer to modify it
    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }
    
    // 5. Get the pixel data and draw the image
    if let context = CGContext(
        data: CVPixelBufferGetBaseAddress(buffer),
        width: Int(width),
        height: Int(height),
        bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue // or .premultipliedFirst
    ), let cgImage = image.cgImage {
        context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    } else {
        return nil
    }
    
    return buffer
}
