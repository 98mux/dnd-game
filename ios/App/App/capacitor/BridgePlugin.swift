//
//  Plugin.swift
//  App
//
//  Created by Filip Tangen on 19/07/2025.
//

import Capacitor

@objc(BridgePlugin)
public class BridgePlugin: CAPPlugin, CAPBridgedPlugin  {
    public let identifier = "BridgePlugin"
    public let jsName = "Bridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "orientation", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lock", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unlock", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "prompts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "images", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "images2", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getTotalImages", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deletePhotos", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getThumbnails", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "photoAccess", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteImageCache", returnType: CAPPluginReturnPromise)


    ]
    
    private let implementation = BridgeImplementation()
    
    @objc func deleteImageCache(_ call: CAPPluginCall) {
        // Define the age threshold in seconds. 60 seconds = 1 minute.
        let maxAgeInSeconds: TimeInterval = 60

        let targetExtensions: Set<String> = ["heic", "jpeg", "jpg", "png", "mov", "mp4"]

        guard let cacheDirectoryURL = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first else {
            call.reject("Failed to locate the cache directory.")
            return
        }

        var deletedFilesCount = 0
        let now = Date() // Get current time once before the loop.
        let fileManager = FileManager.default

        do {
            let fileURLs = try fileManager.contentsOfDirectory(at: cacheDirectoryURL, includingPropertiesForKeys: nil, options: [])
            
            print("Found \(fileURLs.count) items in the cache directory.")


            for fileURL in fileURLs {
                let fileExtension = fileURL.pathExtension.lowercased()
                print("file Extension", fileExtension)
                if targetExtensions.contains(fileExtension) {
                    // --- Start of New Logic ---
                    do {
                        // 1. Get the file's attributes, including its creation date.
                        let attributes = try fileManager.attributesOfItem(atPath: fileURL.path)
                        if let creationDate = attributes[.creationDate] as? Date {
                            
                            // 2. Calculate the file's age in seconds.
                            let fileAge = now.timeIntervalSince(creationDate)
                            
                            // 3. Check if the file is older than the threshold.
                            if fileAge > maxAgeInSeconds {
                                try fileManager.removeItem(at: fileURL)
                                deletedFilesCount += 1
                            }
                        }
                    } catch {
                        // This will catch errors from getting attributes or removing the item.
                        print("Could not process file \(fileURL.lastPathComponent): \(error.localizedDescription)")
                    }
                    // --- End of New Logic ---
                }
            }
            print("Number of deleted files", deletedFilesCount)

            call.resolve([
                "message": "Conditional cache cleanup finished.",
                "deletedCount": deletedFilesCount
            ])

        } catch {
            call.reject("An error occurred while accessing the cache directory: \(error.localizedDescription)")
        }
    }
    
    @objc public func photoAccess(_ call: CAPPluginCall) {
        Task{
            let result = await implementation.requestPhotoLibraryAccess()
            call.resolve(["result": result])
        }
    }
    
    
    @objc public func getTotalImages(_ call: CAPPluginCall) {
        Task{
            let images = await implementation.getTotalImageCount()
            call.resolve(["total": images])
        }
    }


    @objc public func orientation(_ call: CAPPluginCall) {
        let orientationType = implementation.getCurrentOrientationType()
        call.resolve(["type": orientationType])
    }
    
    @objc public func prompts(_ call: CAPPluginCall) {
        guard let prompts = call.getArray("prompts", String.self) else { // Specify String.self for type safety
                call.reject("Must provide an array of strings for 'prompts'")
                return
            }

        Task{
            await implementation.prompts(prompts: prompts)
            call.resolve() // Don't forget to resolve the call when successful
        }
    }
    @objc public func images2(_ call: CAPPluginCall) {
        let batchSize = call.getInt("batchSize")!
        let offset = call.getInt("offset")!



//        guard let imageIds = call.getArray("imageIds", String.self) else {
//            call.reject("Must provide an array of strings for 'imageIds'")
//            return
//        }

        Task { @MainActor in
            // Change to a dictionary to store results keyed by their path
//             var allResults: [String: Any] = [:]

            let allResults = await implementation.analyseImages(batchSize: batchSize, offset: offset)
            let jsonReady: [[String: Any]] = allResults.map { $0.toDict() }

//            let jsonFriendlyResults = r.map { innerArray in
//                innerArray.map { tuple in
//                    return ["className": tuple.className, "similarity": tuple.similarity]
//                }
//            }
             // Resolve the call with the dictionary of results
             call.resolve(["results": jsonReady])
        }
    }

    @objc public func images(_ call: CAPPluginCall) {
        guard let imagePaths = call.getArray("imagePaths", String.self) else {
            call.reject("Must provide an array of strings for 'imagePaths'")
            return
        }

        Task { @MainActor in
            // Change to a dictionary to store results keyed by their path
             var allResults: [String: Any] = [:]

             for path in imagePaths {
                 print("DOING PATH ", path)
                 let result = await implementation.echo(path: path)

                 if let currentPathResult = result {
                     // Map the array of tuples to an array of dictionaries
                     let jsCompatibleCurrentResult = currentPathResult.map { ["className": $0.className, "similarity": $0.similarity] }
                     // Assign the result for the current path to the dictionary
                     allResults[path] = jsCompatibleCurrentResult
                 } else {
                     // Optionally, handle cases where a result for a path is nil
                     // For example, you could assign NSNull() or an empty array
                     allResults[path] = NSNull() // Or [] if you prefer an empty array for no result
                 }
             }
             // Resolve the call with the dictionary of results
             call.resolve(["results": allResults])
        }
    }
    
//    @objc public func deletePhoto(_ call: CAPPluginCall) {
//        guard let identifier = call.getString("identifier") else {
//            call.reject("Must provide a String for 'identifier'")
//            return
//        }
//
//        Task {
//            let success = await implementation.deletePhoto(with: identifier)
//                    call.resolve([
//                        "success": success
//                    ])
//        }
//    }
    
    @objc public func deletePhotos(_ call: CAPPluginCall) {
        guard let identifiers = call.getArray("identifiers", String.self) else {
            call.reject("Must provide an array of Strings for 'identifiers'")
            return
        }

        Task {
            let success = await implementation.deletePhotos(with: identifiers)
            call.resolve([
                "success": success
            ])
        }
    }
    
    @objc public func getThumbnails(_ call: CAPPluginCall) {
        guard let identifiers = call.getArray("identifiers", String.self) else {
            call.reject("Must provide an array of String for 'identifiers'")
            return
        }

        Task {
            let result = await implementation.getThumbnailsBase64(for: identifiers)
            // Convert to JSON-friendly array of dictionaries
            let jsonResults = result.map { thumb in
                return [
                    "identifier": thumb.identifier,
                    "base64": thumb.base64,
                    "width": thumb.width,
                    "height": thumb.height
                ]
            }

            call.resolve(["results": jsonResults])
        }
    }



    
    @objc public func echo(_ call: CAPPluginCall) {
      let path = call.getString("path")!
        
        Task { @MainActor in
            // If `implementation.echo()` is async:
            let result = await implementation.echo(path: path)
            
            // Convert the optional array of tuples to a format Capacitor can bridge to JS
            if let result = result {
                let jsCompatibleResult = result.map { ["className": $0.className, "similarity": $0.similarity] }
                call.resolve(["result": jsCompatibleResult])
            } else {
                call.resolve(["result": NSNull()]) // Explicit null for JS
            }
        
           
           }

    }

    @objc public func lock(_ call: CAPPluginCall) {
      call.resolve()
    }

    @objc public func unlock(_ call: CAPPluginCall) {
      call.resolve();
    }
}
