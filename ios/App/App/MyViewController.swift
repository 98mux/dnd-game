//
//  MyViewController.swift
//  App
//
//  Created by Filip Tangen on 29/07/2024.
//

import UIKit
import Capacitor


class MyViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
//        runCLIPTest()


        // Do any additional setup after loading the view.
    }

    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(CustomPlugin())
        bridge?.registerPluginInstance(BridgePlugin())
        bridge?.registerPluginInstance(LocalStorePlugin())

    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}


private func runCLIPTest() {
    do {
//        let analyzer = try MobileCLIPWrapper()
//        
//        guard let image = UIImage(named: "dog") else {
//            print("Error: Test image not found")
//            return
//        }
//        
//        let (similarity, debugInfo) = try analyzer.analyze(
//            image: image,
//            textQuery: "a dog"
//        )
        
        // 1. Create an instance (typically in your ViewModel or View)
        let imageAnalyzer = AnalyseImage()

        // 2. Call the analyzeDog() function from an async context
        Task {
            await imageAnalyzer.rebuildEmbeddings()
            await imageAnalyzer.analyseImage(imageName:"dog")
            await imageAnalyzer.analyseImage(imageName:"test1")
            //await imageAnalyzer.analyseImage(imageName:"test2")
            await imageAnalyzer.analyseImage(imageName:"test3")



        }
        
//        print(debugInfo)
//        showAlert("Similarity: \(String(format: "%.2f", similarity))")
        
    } catch {
//        print("CLIP Analysis Failed: \(error)")
//        showAlert("Error: \(error.localizedDescription)")
    }
}

//private func showAlert(_ message: String) {
//    let alert = UIAlertController(
//        title: "Results",
//        message: message,
//        preferredStyle: .alert
//    )
//    alert.addAction(UIAlertAction(title: "OK", style: .default))
//    present(alert, animated: true)
//}
