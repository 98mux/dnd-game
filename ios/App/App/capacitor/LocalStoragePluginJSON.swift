import Foundation
import Capacitor

@objc(LocalStorePluginJSON)
public class LocalStorePluginJSON: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LocalStorePluginJSON"
    public let jsName = "LocalStoreJSON"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "keys", returnType: CAPPluginReturnPromise)
    ]
    
    let fileManager = FileManager.default

    /// iCloud container if available, else fallback to app sandbox
    var containerURL: URL? {
        if let iCloud = fileManager.url(forUbiquityContainerIdentifier: nil) {
            return iCloud.appendingPathComponent("LocalStore")
        } else {
            return fileManager.urls(for: .documentDirectory, in: .userDomainMask).first?
                .appendingPathComponent("LocalStore")
        }
    }

    func urlForDatabase(_ db: String) -> URL? {
        containerURL?.appendingPathComponent("\(db).json")
    }

    func loadDatabase(_ db: String) -> [String: Any] {
        guard let url = urlForDatabase(db),
              fileManager.fileExists(atPath: url.path),
              let data = try? Data(contentsOf: url),
              let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return [:]
        }
        return dict
    }

    func saveDatabase(_ db: String, dict: [String: Any]) throws {
        guard let dir = containerURL,
              let url = urlForDatabase(db) else {
            throw NSError(
                domain: "LocalStorePlugin",
                code: 1,
                userInfo: [NSLocalizedDescriptionKey: "Missing file URL for db: \(db)"]
            )
        }

        try fileManager.createDirectory(at: dir, withIntermediateDirectories: true)
        let data = try JSONSerialization.data(withJSONObject: dict, options: .prettyPrinted)
        try data.write(to: url, options: .atomic)
    }

    @objc func set(_ call: CAPPluginCall) {
        
        var startTime = CACurrentMediaTime()

        guard let db = call.getString("db"),
              let key = call.getString("key"),
              let value = call.getAny("value") else {
            call.reject("Missing db, key, or value")
            return
        }

        var store = loadDatabase(db)
        store[key] = value

        do {
            try saveDatabase(db, dict: store)
            var endTime = CACurrentMediaTime()
            print("Saved to disk \(endTime - startTime) seconds ⏱️")

            call.resolve()
        } catch {
            call.reject("Failed to save: \(error.localizedDescription)")
        }
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let db = call.getString("db"),
              let key = call.getString("key") else {
            call.reject("Missing db or key")
            return
        }

        let store = loadDatabase(db)
        if let value = store[key] {
            call.resolve(["value": value])
        } else {
            call.resolve(["value": NSNull()])
        }
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let db = call.getString("db"),
              let key = call.getString("key") else {
            call.reject("Missing db or key")
            return
        }

        var store = loadDatabase(db)
        store.removeValue(forKey: key)

        do {
            try saveDatabase(db, dict: store)
            call.resolve()
        } catch {
            call.reject("Failed to save after delete: \(error.localizedDescription)")
        }
    }

    @objc func keys(_ call: CAPPluginCall) {
        guard let db = call.getString("db") else {
            call.reject("Missing db")
            return
        }

        let store = loadDatabase(db)
        let keys = Array(store.keys)
        call.resolve(["keys": keys])
    }

    @objc func clear(_ call: CAPPluginCall) {
        guard let db = call.getString("db"),
              let url = urlForDatabase(db) else {
            call.reject("Missing db")
            return
        }

        do {
            try fileManager.removeItem(at: url)
            call.resolve()
        } catch {
            call.reject("Failed to remove db file: \(error.localizedDescription)")
        }
    }
}
