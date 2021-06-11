import UIKit
import MobileCoreServices

class ShareViewController: UIViewController {

  let urlContentType = kUTTypeURL as String
  var sharedUrls: [String] = []
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    print("viewDidLoad: show loading view here")
    // Show loading view
  }
  
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    print("viewDidAppear: start process shared data")
    self.processRequest()
  }

  private func processRequest() {
    guard let inputItems = self.extensionContext?.inputItems, inputItems.count > 0,
          let inputItem = inputItems[0] as? NSExtensionItem,
          let attachments = inputItem.attachments, attachments.count > 0 else {
      self.cancelRequest()
      return
    }
    
    for (_, attachment) in attachments.enumerated() {
      if !attachment.hasItemConformingToTypeIdentifier(urlContentType) {
        self.cancelRequest()
        return
      }

      attachment.loadItem(forTypeIdentifier: urlContentType, options: nil) { [unowned self] data, error in
        guard let url = data as? URL, error == nil else {
          self.cancelRequest()
          return
        }

        self.sharedUrls.append(url.absoluteString)
        if self.sharedUrls.count == attachments.count {
          self.completeRequest()
        }
      }
    }
  }
  
  private func completeRequest() {
    print("in completeRequest")
    guard self.sharedUrls.count > 0 else {
      self.cancelRequest()
      return
    }

    if (!Blockstack.shared.isUserSignedIn()) {
      print("userData is nil, show not sign in here")
      // Not sign in
      return
    }
    
    print("Found userData, call addLink")
    // Support only 1 url for now!
    Blockstack.shared.addLink(url: self.sharedUrls[0]) { publicUrl, error in
      guard let _ = publicUrl, error != nil else {
        print("Error addLink, display error here.")
        return
      }
      
      print("Succeed addLink, display green check here and timer to hide")
      self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
    }
  }
  
  private func cancelRequest() {
    
    let alert = UIAlertController(title: "Invalid link!",
                                  message: "Only URL links can be saved.",
                                  preferredStyle: .alert)
    
    let action = UIAlertAction(title: "Close", style: .cancel) { _ in
      self.dismiss(animated: true, completion: nil)
    }
    
    alert.addAction(action)
    present(alert, animated: true, completion: nil)
    
    self.extensionContext!.cancelRequest(withError: NSError(domain:"BRACEDOTTO_ERROR",
                                                            code: 0,
                                                            userInfo: nil))
  }
}
