//
//  KeyValue.swift
//  App
//
//  Created by Filip Tangen on 28/07/2025.
//

import Foundation
import Capacitor


/// A global manager to access different key-value stores.
/// This acts as the main entry point for the library.
public enum SwiftKV {
    private static let manager = SwiftKVManager()

    /// Accesses a specific key-value store by its database name.
    ///
    /// - Parameter databaseName: The unique identifier for the database.
    /// - Returns: A `SwiftKVStore` instance for the given name.
    public static func store(databaseName: String = "default") -> SwiftKVStore {
        return manager.store(forName: databaseName)
    }
}

/// Manages all the different database instances.
/// This class ensures that there's only one instance of each database.
final class SwiftKVManager {
    private var stores: [String: SwiftKVStore] = [:]
    private let accessQueue = DispatchQueue(label: "com.swiftkv.manager.accessQueue", attributes: .concurrent)

    /// Returns or creates a `SwiftKVStore` for a given name.
    /// This method is thread-safe.
    func store(forName name: String) -> SwiftKVStore {
        // Use the write barrier to ensure thread-safe access and modification
        var store: SwiftKVStore!
        accessQueue.sync(flags: .barrier) {
            if let existingStore = stores[name] {
                store = existingStore
            } else {
                let newStore = SwiftKVStore(databaseName: name)
                stores[name] = newStore
                store = newStore
            }
        }
        return store
    }
}

/// A high-performance, thread-safe, key-value store.
/// It uses an in-memory cache with a file-based persistence layer.
public final class SwiftKVStore {
    private let databaseName: String
    private var cache: [String: String] = [:]
    private let fileURL: URL
    
    // A serial queue to ensure atomic operations on the cache and file.
    private let ioQueue = DispatchQueue(label: "com.swiftkv.store.ioQueue")
    
    // Throttling mechanism for saving data to disk.
    private var saveWorkItem: DispatchWorkItem?
    private let saveThrottleInterval: TimeInterval = 0.5 // 500ms throttle

    /// Initializes a new key-value store.
    ///
    /// - Parameter databaseName: The name of the database, used for the filename.
    init(databaseName: String) {
        self.databaseName = databaseName
        
        // Determine the file path in the application's support directory.
        let fileManager = FileManager.default
        guard let supportDirectory = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            fatalError("Unable to access application support directory.")
        }
        
        let databaseDirectory = supportDirectory.appendingPathComponent("SwiftKV")
        if !fileManager.fileExists(atPath: databaseDirectory.path) {
            try? fileManager.createDirectory(at: databaseDirectory, withIntermediateDirectories: true, attributes: nil)
        }
        
        self.fileURL = databaseDirectory.appendingPathComponent("\(databaseName).json")
        
        // Load existing data from disk asynchronously.
        loadDataFromDisk()
    }

    // MARK: - Public API

    /// Saves a key-value pair.
    ///
    /// - Parameters:
    ///   - key: The key to associate with the value.
    ///   - value: The string value to save.
    public func set(key: String, value: String) async {
        await withCheckedContinuation { continuation in
            ioQueue.async {
                self.cache[key] = value
                self.scheduleSaveToDisk()
                continuation.resume()
            }
        }
    }

    /// Retrieves a value for a given key.
    ///
    /// - Parameter key: The key for the value to retrieve.
    /// - Returns: The string value, or `nil` if the key does not exist.
    public func get(key: String) async -> String? {
        await withCheckedContinuation { continuation in
            ioQueue.async {
                let value = self.cache[key]
                continuation.resume(returning: value)
            }
        }
    }

    /// Removes a key-value pair.
    ///
    /// - Parameter key: The key to remove.
    public func remove(key: String) async {
        await withCheckedContinuation { continuation in
            ioQueue.async {
                self.cache.removeValue(forKey: key)
                self.scheduleSaveToDisk()
                continuation.resume()
            }
        }
    }
    
    /// Retrieves all key-value pairs.
    ///
    /// - Returns: A dictionary containing all items.
    public func all() async -> [String: String] {
        await withCheckedContinuation { continuation in
            ioQueue.async {
                continuation.resume(returning: self.cache)
            }
        }
    }

    /// Clears all key-value pairs from the store.
    public func clearAll() async {
        await withCheckedContinuation { continuation in
            ioQueue.async {
                self.cache.removeAll()
                self.scheduleSaveToDisk() // Schedule a save to write the empty state
                continuation.resume()
            }
        }
    }

    // MARK: - Private Helpers

    /// Schedules a throttled save operation to persist the cache to disk.
    private func scheduleSaveToDisk() {
        // Invalidate any existing save operation.
        saveWorkItem?.cancel()

        // Create a new work item to perform the save.
        let workItem = DispatchWorkItem { [weak self] in
            self?.persistCache()
        }
        
        saveWorkItem = workItem
        
        // Schedule the save after the throttle interval.
        ioQueue.asyncAfter(deadline: .now() + saveThrottleInterval, execute: workItem)
    }
    
    /// Loads the data from the JSON file into the in-memory cache.
    private func loadDataFromDisk() {
        ioQueue.async {
            guard FileManager.default.fileExists(atPath: self.fileURL.path) else {
                // No file exists, start with an empty cache.
                return
            }
            
            do {
                let data = try Data(contentsOf: self.fileURL)
                let decoder = JSONDecoder()
                self.cache = try decoder.decode([String: String].self, from: data)
            } catch {
                print("SwiftKV Error: Failed to load data for database '\(self.databaseName)'. Error: \(error)")
            }
        }
    }

    /// Writes the current state of the cache to the disk.
    private func persistCache() {
        var startTime = CACurrentMediaTime()

        do {
            let encoder = JSONEncoder()
            let data = try encoder.encode(self.cache)
            try data.write(to: self.fileURL, options: .atomic)
        } catch {
            print("SwiftKV Error: Failed to save data for database '\(self.databaseName)'. Error: \(error)")
        }
        var endTime = CACurrentMediaTime()
        print("Saved to disk \(endTime - startTime) seconds ⏱️")
    }
}
