//
//  CustomPlugin.swift
//  App
//
//  Created by Filip Tangen on 29/07/2024.
//

import Foundation
import Capacitor
import UIKit

import RevenueCat
import RevenueCatUI

import SwiftUI
struct ContentView: View {
    var body: some View {
        //Text("Hello, World!")
        EmptyView()
    }
}


struct PaywallView: View {
    var body: some View {
        ContentView()
            .presentPaywallIfNeeded(
                requiredEntitlementIdentifier: "proyearlyplan",
                purchaseCompleted: { customerInfo in
                    print("Purchase completed: \(customerInfo.entitlements)")
                },
                restoreCompleted: { customerInfo in
                    // Paywall will be dismissed automatically if "pro" is now active.
                    print("Purchases restored: \(customerInfo.entitlements)")
                }
            )
    }
}

class ViewController: UIViewController {

    @IBAction func presentPaywall() {
        let controller = PaywallViewController()
        controller.delegate = self

        present(controller, animated: false, completion: nil)
    }

}

extension ViewController: PaywallViewControllerDelegate {

    func paywallViewController(_ controller: PaywallViewController,
                               didFinishPurchasingWith customerInfo: CustomerInfo) {

    }

}
class AlertUtils {
    static func displayMessage() {
        let alert = UIAlertController(title: "Hello, SwiftUI", message: "This is a message from SwiftUI!", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
        
        DispatchQueue.main.async {
            if let rootVC = UIApplication.shared.windows.first?.rootViewController {
                rootVC.present(alert, animated: true, completion: nil)
            }
        }
    }
    
    static func presentPaywall() {
        DispatchQueue.main.async {
            if let rootVC = UIApplication.shared.windows.first?.rootViewController {
                let paywallView = PaywallView()
                let hostingController = UIHostingController(rootView: paywallView)
                rootVC.present(hostingController, animated: true, completion: nil)
            }
           // if let rootVC = UIApplication.shared.windows.first?.rootViewController {
            //    let viewController = ViewController()
            //    rootVC.present(viewController, animated: false) {
            //        viewController.presentPaywall()
            //    }
            //}
        }
    }
}

@objc(CustomPlugin)
public class CustomPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CustomPlugin"
    public let jsName = "CustomPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "displayPaywall", returnType: CAPPluginReturnPromise)
    ]

    @objc func displayPaywall(_ call: CAPPluginCall) {
        // let value = call.getString("value") ?? ""
        //AlertUtils.displayMessage()
        AlertUtils.presentPaywall()

        call.resolve()

        //call.resolve(["value": value])
    }
}
