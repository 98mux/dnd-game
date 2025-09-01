import Foundation
import Capacitor

@objc(LocalStorePlugin3)
public class LocalStorePlugin3: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LocalStorePlugin3"
    public let jsName = "LocalStore3"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "keys", returnType: CAPPluginReturnPromise)
    ]

    let fileManager = FileManager.default

    var containerURL: URL? {
        if let iCloud = fileManager.url(forUbiquityContainerIdentifier: nil) {
            return iCloud.appendingPathComponent("LocalStore")
        } else {
            return fileManager.urls(for: .documentDirectory, in: .userDomainMask).first?
                .appendingPathComponent("LocalStore")
        }
    }

    func dbDirectory(_ db: String) -> URL? {
        containerURL?.appendingPathComponent(db)
    }

    func keyPath(db: String, key: String) -> URL? {
        dbDirectory(db)?.appendingPathComponent("\(key).bin")
    }

    @objc func set(_ call: CAPPluginCall) {
        
        let startTime = CACurrentMediaTime()

        guard let db = call.getString("db"),
              let key = call.getString("key"),
              let value = call.getAny("value") else {
            call.reject("Missing db, key, or value")
            return
        }
        
        print("HERE 0 \(CACurrentMediaTime() - startTime) seconds ⏱️")


        DispatchQueue.global(qos: .utility).async {
            do {
                print("HERE 1 \(CACurrentMediaTime() - startTime) seconds ⏱️")

                let dir = self.dbDirectory(db)!
                try self.fileManager.createDirectory(at: dir, withIntermediateDirectories: true)

                let encoder = PropertyListEncoder()
                encoder.outputFormat = .binary
                let data = try encoder.encode(AnyCodable(value))

                let path = self.keyPath(db: db, key: key)!
                try data.write(to: path, options: .atomic)

                DispatchQueue.main.async {
                    print("Saved to disk in \(CACurrentMediaTime() - startTime) seconds ⏱️")
                    call.resolve()
                }
            } catch {
                DispatchQueue.main.async {
                    call.reject("Save failed: \(error.localizedDescription)")
                }
            }
        }
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let db = call.getString("db"),
              let key = call.getString("key"),
              let path = keyPath(db: db, key: key),
              fileManager.fileExists(atPath: path.path) else {
            call.resolve(["value": NSNull()])
            return
        }

        DispatchQueue.global(qos: .utility).async {
            do {
                let data = try Data(contentsOf: path)
                let decoder = PropertyListDecoder()
                let value = try decoder.decode(AnyCodable.self, from: data).value

                DispatchQueue.main.async {
                    call.resolve(["value": value])
                }
            } catch {
                DispatchQueue.main.async {
                    call.reject("Read failed: \(error.localizedDescription)")
                }
            }
        }
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let db = call.getString("db"),
              let key = call.getString("key"),
              let path = keyPath(db: db, key: key) else {
            call.reject("Missing db or key")
            return
        }

        DispatchQueue.global(qos: .utility).async {
            do {
                if self.fileManager.fileExists(atPath: path.path) {
                    try self.fileManager.removeItem(at: path)
                }
                DispatchQueue.main.async {
                    call.resolve()
                }
            } catch {
                DispatchQueue.main.async {
                    call.reject("Remove failed: \(error.localizedDescription)")
                }
            }
        }
    }

    @objc func clear(_ call: CAPPluginCall) {
        guard let db = call.getString("db"),
              let dir = dbDirectory(db),
              fileManager.fileExists(atPath: dir.path) else {
            call.resolve()
            return
        }

        DispatchQueue.global(qos: .utility).async {
            do {
                let files = try self.fileManager.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)
                for file in files {
                    try self.fileManager.removeItem(at: file)
                }
                DispatchQueue.main.async {
                    call.resolve()
                }
            } catch {
                DispatchQueue.main.async {
                    call.reject("Clear failed: \(error.localizedDescription)")
                }
            }
        }
    }

    @objc func keys(_ call: CAPPluginCall) {
        guard let db = call.getString("db"),
              let dir = dbDirectory(db),
              fileManager.fileExists(atPath: dir.path) else {
            call.resolve(["keys": []])
            return
        }

        DispatchQueue.global(qos: .utility).async {
            do {
                let files = try self.fileManager.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)
                let keys = files
                    .filter { $0.pathExtension == "bin" }
                    .map { $0.deletingPathExtension().lastPathComponent }

                DispatchQueue.main.async {
                    call.resolve(["keys": keys])
                }
            } catch {
                DispatchQueue.main.async {
                    call.reject("Keys failed: \(error.localizedDescription)")
                }
            }
        }
    }
}


public struct AnyCodable: Codable {
    public let value: Any

    public init(_ value: Any) {
        self.value = value
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let string = try? container.decode(String.self) {
            value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            value = dict.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Unsupported value")
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch value {
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let bool as Bool:
            try container.encode(bool)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dict as [String: Any]:
            try container.encode(dict.mapValues { AnyCodable($0) })
        default:
            throw EncodingError.invalidValue(value, EncodingError.Context(codingPath: container.codingPath, debugDescription: "Unsupported value"))
        }
    }
}
