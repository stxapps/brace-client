import UIKit
import MobileCoreServices

class ShareViewController: UIViewController {

    let APP_DOMAIN_NAME = "bracedotto://app"
    let SAVE_TO_BRACE = "/save-to-brace"

    let urlContentType = kUTTypeURL as String
    var sharedUrls: [String] = []

    override func viewDidLoad() {
        super.viewDidLoad()

        let inputItems = self.extensionContext!.inputItems
        guard inputItems.count > 0 else {
            self.cancelRequest()
            return
        }

        for (i, _inputItem) in inputItems.enumerated() {
            guard let inputItem = _inputItem as? NSExtensionItem else {
                self.cancelRequest()
                return
            }

            guard let attachments = inputItem.attachments, attachments.count > 0 else {
                self.cancelRequest()
                return
            }

            for (j, attachment) in attachments.enumerated() {
                if !attachment.hasItemConformingToTypeIdentifier(urlContentType) {
                    self.cancelRequest()
                    return
                }

                handleUrl(attachment: attachment,
                          isLast: i == inputItems.count - 1 && j == attachments.count - 1)
            }
        }
    }

    private func handleUrl (attachment: NSItemProvider, isLast: Bool) {
        attachment.loadItem(forTypeIdentifier: urlContentType,
                            options: nil) { [unowned self] data, error in

            guard error == nil else {
                self.cancelRequest()
                return
            }

            guard let url = data as? URL else {
                self.cancelRequest()
                return
            }

            self.sharedUrls.append(url.absoluteString)
            if isLast {
                self.completeRequest()
            }
        }
    }

    private func completeRequest() {

        guard self.sharedUrls.count > 0 else {
            self.cancelRequest()
            return
        }

        let sharedUrls = self.sharedUrls.joined(separator: "")
        guard let url = URL(string: "\(APP_DOMAIN_NAME)\(SAVE_TO_BRACE)?text=\(sharedUrls)") else {
            self.cancelRequest()
            return
        }
        
        self.extensionContext!.open(url, completionHandler: nil)
        
        var responder = self as UIResponder?
        let selectorOpenURL = sel_registerName("openURL:")

        while (responder != nil) {
            if responder!.responds(to: selectorOpenURL) {
                responder!.perform(selectorOpenURL, with: url)
                break
            }

            responder = responder!.next
        }

        self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
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
