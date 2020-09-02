import UIKit
import Social
import MobileCoreServices

class ShareViewController: SLComposeServiceViewController {

    let APP_DOMAIN_NAME = "bracedotto://app"
    let SAVE_TO_BRACE = "/save-to-brace"

    let urlContentType = kUTTypeURL as String
    var sharedUrls: [String] = []

    override func isContentValid() -> Bool {
        guard let context = self.extensionContext else {
            return false
        }

        let inputItems = context.inputItems
        for (_, _inputItem) in inputItems.enumerated() {
            guard let inputItem = _inputItem as? NSExtensionItem else {
                return false
            }

            guard let attachments = inputItem.attachments else {
                return false
            }

            for (_, attachment) in attachments.enumerated() {
                if !attachment.hasItemConformingToTypeIdentifier(urlContentType) {
                    return false
                }
            }
        }

        return true
    }

    override func didSelectPost() {

        let inputItems = self.extensionContext!.inputItems
        for (i, _inputItem) in inputItems.enumerated() {
            guard let inputItem = _inputItem as? NSExtensionItem else {
                self.cancelRequest()
                return
            }

            guard let attachments = inputItem.attachments else {
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

    override func configurationItems() -> [Any]! {
        // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
        return []
    }

    private func handleUrl (attachment: NSItemProvider, isLast: Bool) {
        attachment.loadItem(forTypeIdentifier: urlContentType,
                                      options: nil) { [weak self] data, error in
            if error == nil, let item = data as? URL, let this = self {
                this.sharedUrls.append(item.absoluteString)
                if isLast {
                    this.completeRequest()
                }
            } else {
                self!.cancelRequest()
            }
        }
    }

    private func completeRequest() {

        guard self.sharedUrls.count > 0 else {
            self.cancelRequest()
            return
        }

        let sharedUrls = self.sharedUrls.joined(separator: "")
        guard let url = URL(string: "\(APP_DOMAIN_NAME)\(SAVE_TO_BRACE)?addingUrls=\(sharedUrls)") else {
            self.cancelRequest()
            return
        }

        self.extensionContext!.open(url, completionHandler: { completed in

            if !completed {
                self.cancelRequest()
                return
            }

            self.extensionContext!.completeRequest(returningItems: [],
                                                completionHandler: nil)
        })
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
