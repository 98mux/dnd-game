import Foundation
import PhotosUI
import UIKit

class ImagePicker: NSObject, PHPickerViewControllerDelegate {
    private var continuation: CheckedContinuation<[String], Never>?
    private weak var presenter: UIViewController?

    init?(presenter: UIViewController?) {
        guard let presenter = presenter else { return nil }
        self.presenter = presenter
    }

    func selectImages(limit: Int = 0) async -> [String] {
        var config = PHPickerConfiguration()
        config.selectionLimit = limit
        config.filter = .images

        let picker = PHPickerViewController(configuration: config)
        picker.delegate = self

        presenter?.present(picker, animated: true)

        return await withCheckedContinuation { continuation in
            self.continuation = continuation
        }
    }

    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        picker.dismiss(animated: true)

        let identifiers = results.compactMap { $0.assetIdentifier }
        continuation?.resume(returning: identifiers)
        continuation = nil
    }
}

