import Foundation
import Capacitor

// Make sure the SwiftKV.swift file from the previous answer is also included in your project.

@objc(LocalStorePlugin)
public class LocalStorePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LocalStorePlugin"
    public let jsName = "LocalStore"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "keys", returnType: CAPPluginReturnPromise)
    ]
    
    // The complex FileManager logic is no longer needed, thanks to SwiftKV! ✨

    /// Sets a string value for a given key in a specific database.
    @objc func set(_ call: CAPPluginCall) {
        var startTime = CACurrentMediaTime()

        guard let db = call.getString("db") else {
            call.reject("Missing 'db' parameter")
            return
        }
        guard let key = call.getString("key") else {
            call.reject("Missing 'key' parameter")
            return
        }
        // Value is now expected to be a string directly from JS.
        guard let value = call.getString("value") else {
            call.reject("Missing 'value' parameter or it's not a string")
            return
        }

        // Run the async operation in a Task.
        Task {
            await SwiftKV.store(databaseName: db).set(key: key, value: value)
            call.resolve()
            var endTime = CACurrentMediaTime()
            print("Saved \(endTime - startTime) seconds ⏱️")
        }
    }

    /// Gets a string value for a given key.
    @objc func get(_ call: CAPPluginCall) {
        guard let db = call.getString("db") else {
            call.reject("Missing 'db' parameter")
            return
        }
        guard let key = call.getString("key") else {
            call.reject("Missing 'key' parameter")
            return
        }
        
        Task {
            // Retrieve the string from our store.
            if let value = await SwiftKV.store(databaseName: db).get(key: key) {
                 // Resolve with the string value.
                call.resolve(["value": value])
            } else {
                // Return null if key doesn't exist, matching JS localStorage behavior.
                call.resolve(["value": NSNull()])
            }
        }
    }

    /// Removes a key-value pair.
    @objc func remove(_ call: CAPPluginCall) {
        guard let db = call.getString("db") else {
            call.reject("Missing 'db' parameter")
            return
        }
        guard let key = call.getString("key") else {
            call.reject("Missing 'key' parameter")
            return
        }

        Task {
            await SwiftKV.store(databaseName: db).remove(key: key)
            call.resolve()
        }
    }

    /// Clears all data from a specific database.
    @objc func clear(_ call: CAPPluginCall) {
        guard let db = call.getString("db") else {
            call.reject("Missing 'db' parameter")
            return
        }

        Task {
            await SwiftKV.store(databaseName: db).clearAll()
            call.resolve()
        }
    }

    /// Returns all keys for a specific database.
    @objc func keys(_ call: CAPPluginCall) {
        guard let db = call.getString("db") else {
            call.reject("Missing 'db' parameter")
            return
        }
        
        Task {
            let allItems = await SwiftKV.store(databaseName: db).all()
            let keys = Array(allItems.keys)
            call.resolve(["keys": keys])
        }
    }
}

