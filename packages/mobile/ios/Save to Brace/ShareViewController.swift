import UIKit
import MobileCoreServices
import NVActivityIndicatorView

class ShareViewController: UIViewController {

  let urlContentType = kUTTypeURL as String
  let textContentType = kUTTypePlainText as String
  var sharedUrls: [String] = []
  var didRenderAdded = false
  var timer: Timer? = nil

  let normalTextSm = UIFont.init(name: "Inter-Regular", size: 14)!
  let normalTextBase = UIFont.init(name: "Inter-Regular", size: 16)!
  let semiBoldTextLg = UIFont.init(name: "Inter-SemiBold", size: 18)!

  let gray400 = UIColor.init(red: 156/255, green: 163/255, blue: 175/255, alpha: 1)
  let gray500 = UIColor.init(red: 107/255, green: 114/255, blue: 128/255, alpha: 1)
  let gray600 = UIColor.init(red: 75/255, green: 85/255, blue: 99/255, alpha: 1)
  let gray800 = UIColor.init(red: 31/255, green: 41/255, blue: 55/255, alpha: 1)

  let SM_WIDTH = CGFloat(640)

  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    self.renderAdding()
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    DispatchQueue.global(qos: .userInitiated).async {
      // From debug, viewDidDisappear is not called, so reset values here.
      if let t = self.timer {
        t.invalidate()
      }
      self.sharedUrls = []
      self.didRenderAdded = false
      self.timer = nil

      self.processRequest()
    }
  }

  private func processRequest() {
    guard let inputItems = self.extensionContext?.inputItems, inputItems.count > 0,
          let inputItem = inputItems[0] as? NSExtensionItem,
          let attachments = inputItem.attachments, attachments.count > 0 else {
      self.renderInvalid()
      return
    }

    // Support only 1 url for now. The callback is async and don't know how to await!
    for (_, attachment) in attachments.enumerated() {
      if attachment.hasItemConformingToTypeIdentifier(urlContentType) {
        attachment.loadItem(forTypeIdentifier: urlContentType, options: nil) { [unowned self] data, error in
          if let url = data as? URL, error == nil {
            self.sharedUrls.append(url.absoluteString)
          }
          self.addLink()
        }
        return
      }
    }
    // For all attachments, find url first then text. Firefox provides 2 attachments: first text, second url.
    for (_, attachment) in attachments.enumerated() {
      if attachment.hasItemConformingToTypeIdentifier(textContentType) {
        attachment.loadItem(forTypeIdentifier: textContentType, options: nil) { [unowned self] data, error in
          if let rawText = data as? String, error == nil {
            let text = rawText.trimmingCharacters(in: .whitespacesAndNewlines)
            if !text.isEmpty {
              self.sharedUrls.append(text)
            }
          }
          self.addLink()
        }
        return
      }
    }

    self.renderInvalid()
    return
  }

  private func addLink() {
    guard self.sharedUrls.count > 0 else {
      self.renderInvalid()
      return
    }

    if !Blockstack.shared.isUserSignedIn() {
      self.renderNotSignedIn()
      return
    }

    Blockstack.shared.addLink(url: self.sharedUrls[0]) { publicUrl, error in
      guard let _ = publicUrl, error == nil else {
        print("Died adding with error: ", error.debugDescription)
        self.renderError()
        return
      }

      Blockstack.shared.setDidShare()
      self.renderAdded()
    }
  }

  @objc private func completeRequest() {
    if let t = self.timer {
      t.invalidate()
    }
    self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
  }

  @objc private func onBackgroundBtnClick() {
    if self.didRenderAdded {
      self.completeRequest()
    }
  }

  private func _render(_ contentView: UIView, pb: Int = -88) {
    DispatchQueue.main.async {
      self.view.removeConstraints(self.view.constraints)
      self.view.subviews.forEach { $0.removeFromSuperview() }

      let btn = UIButton()
      btn.backgroundColor = UIColor.init(red: 0, green: 0, blue: 0, alpha: 0.01)
      btn.addTarget(self, action: #selector(self.onBackgroundBtnClick), for: .touchUpInside)
      btn.translatesAutoresizingMaskIntoConstraints = false
      self.view.addSubview(btn)

      let blConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.left, relatedBy: NSLayoutConstraint.Relation.equal, toItem: self.view, attribute: NSLayoutConstraint.Attribute.left, multiplier: 1, constant: 0)
      let brConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.right, relatedBy: NSLayoutConstraint.Relation.equal, toItem: self.view, attribute: NSLayoutConstraint.Attribute.right, multiplier: 1, constant: 0)
      let bbConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: self.view, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: 0)
      let btConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.top, relatedBy: NSLayoutConstraint.Relation.equal, toItem: self.view, attribute: NSLayoutConstraint.Attribute.top, multiplier: 1, constant: 0)
      self.view.addConstraints([blConstraint, brConstraint, bbConstraint, btConstraint])

      contentView.backgroundColor = .white
      contentView.layer.cornerRadius = 16
      contentView.translatesAutoresizingMaskIntoConstraints = false
      self.view.addSubview(contentView)

      let xConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.centerX, relatedBy: NSLayoutConstraint.Relation.equal, toItem: self.view, attribute: NSLayoutConstraint.Attribute.centerX, multiplier: 1, constant: 0)
      self.view.addConstraint(xConstraint)

      let screenWidth = UIScreen.main.bounds.width
      if screenWidth < self.SM_WIDTH {
        let yConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: self.view, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: CGFloat(pb))
        self.view.addConstraint(yConstraint)
      } else {
        let yConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.centerY, relatedBy: NSLayoutConstraint.Relation.equal, toItem: self.view, attribute: NSLayoutConstraint.Attribute.centerY, multiplier: 1, constant: 0)
        self.view.addConstraint(yConstraint)
      }
    }
  }

  private func renderAdding() {
    DispatchQueue.main.async {
      let contentView = UIView()

      let contentViewWidth = 192, contentViewHeight = 192
      let cwConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.width, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: CGFloat(contentViewWidth))
      let chConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: CGFloat(contentViewHeight))
      contentView.addConstraints([cwConstraint, chConstraint])

      let loader = NVActivityIndicatorView(frame: CGRect.init(x: 0, y: 0, width: 72, height: 72), type: .ballPulse, color: self.gray400, padding: 8)
      loader.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(loader)

      // loaderTop = paddingTop + (((contentViewHeight - textHeight - paddingTop - paddingBottom) - loaderHeight) / 2)
      let loaderTop = 16 + (((contentViewHeight - 36 - 16 - 16) - 72) / 2)
      let lxConstraint = NSLayoutConstraint(item: loader, attribute: NSLayoutConstraint.Attribute.centerX, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.centerX, multiplier: 1, constant: 0)
      let ltConstraint = NSLayoutConstraint(item: loader, attribute: NSLayoutConstraint.Attribute.top, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.top, multiplier: 1, constant: CGFloat(loaderTop))
      contentView.addConstraints([lxConstraint, ltConstraint])

      let text = UILabel()
      text.font = self.normalTextBase
      text.textColor = self.gray600
      text.textAlignment = NSTextAlignment.center
      text.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(text)

      let s = NSMutableAttributedString(string: "Saving to ")
      s.append(NSMutableAttributedString(string: "Brace", attributes: [NSAttributedString.Key.font: self.semiBoldTextLg, NSAttributedString.Key.foregroundColor: self.gray800]))
      text.attributedText = s

      let tlConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.left, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.left, multiplier: 1, constant: 16)
      let trConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.right, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.right, multiplier: 1, constant: -16)
      let tbConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: -16)
      let thConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: 36)
      contentView.addConstraints([tlConstraint, trConstraint, tbConstraint, thConstraint])

      self._render(contentView)
      loader.startAnimating()
    }
  }

  private func renderAdded() {
    DispatchQueue.main.async {
      let contentView = UIView()

      let contentViewWidth = 192, contentViewHeight = 192
      let cwConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.width, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: CGFloat(contentViewWidth))
      let chConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: CGFloat(contentViewHeight))
      contentView.addConstraints([cwConstraint, chConstraint])

      let img = UIImageView(image: UIImage(named: "GreenCheck"))
      img.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(img)

      // imgTop = paddingTop + (((contentViewHeight - textHeight - paddingTop - paddingBottom) - imgHeight) / 2)
      let imgTop = 16 + (((contentViewHeight - 36 - 16 - 16) - 72) / 2)
      let ixConstraint = NSLayoutConstraint(item: img, attribute: NSLayoutConstraint.Attribute.centerX, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.centerX, multiplier: 1, constant: 0)
      let itConstraint = NSLayoutConstraint(item: img, attribute: NSLayoutConstraint.Attribute.top, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.top, multiplier: 1, constant: CGFloat(imgTop))
      contentView.addConstraints([ixConstraint, itConstraint])

      let text = UILabel()
      text.font = self.normalTextBase
      text.textColor = self.gray600
      text.textAlignment = NSTextAlignment.center
      text.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(text)

      let s = NSMutableAttributedString(string: "Saved to ")
      s.append(NSMutableAttributedString(string: "Brace", attributes: [NSAttributedString.Key.font: self.semiBoldTextLg, NSAttributedString.Key.foregroundColor: self.gray800]))
      text.attributedText = s

      let tlConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.left, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.left, multiplier: 1, constant: 16)
      let trConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.right, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.right, multiplier: 1, constant: -16)
      let tbConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: -16)
      let thConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: 36)
      contentView.addConstraints([tlConstraint, trConstraint, tbConstraint, thConstraint])

      self._render(contentView)
      self.didRenderAdded = true
      if self.timer == nil {
        self.timer = Timer.scheduledTimer(withTimeInterval: 2, repeats: false) { _ in
          self.completeRequest()
        }
      }
    }
  }

  private func renderNotSignedIn() {
    DispatchQueue.main.async {
      let contentView = UIView()

      let contentViewWidth = 256, contentViewHeight = 256
      let cwConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.width, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: CGFloat(contentViewWidth))
      let chConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: CGFloat(contentViewHeight))
      contentView.addConstraints([cwConstraint, chConstraint])

      let img = UIImageView(image: UIImage(named: "YellowExclamation"))
      img.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(img)

      // imgTop = paddingTop + (((contentViewHeight - textHeight - btnHeight - spaceBtwTextAndBtn - paddingTop - paddingBottom) - imgHeight) / 2) + a bit down
      let imgTop = 16 + (((contentViewHeight - 36 - 36 - 36 - 16 - 16) - 72) / 2) + 4
      let ixConstraint = NSLayoutConstraint(item: img, attribute: NSLayoutConstraint.Attribute.centerX, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.centerX, multiplier: 1, constant: 0)
      let itConstraint = NSLayoutConstraint(item: img, attribute: NSLayoutConstraint.Attribute.top, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.top, multiplier: 1, constant: CGFloat(imgTop))
      contentView.addConstraints([ixConstraint, itConstraint])

      let text = UILabel()
      text.font = self.normalTextBase
      text.textColor = self.gray600
      text.textAlignment = NSTextAlignment.center
      text.text = "Please sign in first"
      text.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(text)

      let tlConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.left, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.left, multiplier: 1, constant: 16)
      let trConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.right, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.right, multiplier: 1, constant: -16)
      let tbConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: (-16 + -36 + -36))
      let thConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: 36)
      contentView.addConstraints([tlConstraint, trConstraint, tbConstraint, thConstraint])

      let btn = UIButton()
      btn.backgroundColor = .clear
      btn.setTitleColor(self.gray500, for: .normal)
      btn.setAttributedTitle(NSMutableAttributedString(string: "Close", attributes: [NSAttributedString.Key.font: self.normalTextSm]), for: .normal)
      btn.addTarget(self, action: #selector(self.completeRequest), for: .touchUpInside)
      btn.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(btn)

      let blConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.left, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.left, multiplier: 1, constant: 16)
      let brConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.right, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.right, multiplier: 1, constant: -16)
      let bbConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: -16)
      let bhConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: 36)
      contentView.addConstraints([blConstraint, brConstraint, bbConstraint, bhConstraint])

      self._render(contentView)
    }
  }

  private func renderInvalid() {
    DispatchQueue.main.async {
      let contentView = UIView()

      let contentViewWidth = 256, contentViewHeight = 256
      let cwConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.width, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: CGFloat(contentViewWidth))
      let chConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: CGFloat(contentViewHeight))
      contentView.addConstraints([cwConstraint, chConstraint])

      let img = UIImageView(image: UIImage(named: "YellowExclamation"))
      img.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(img)

      // imgTop = paddingTop + (((contentViewHeight - textHeight - btnHeight - spaceBtwTextAndBtn - paddingTop - paddingBottom) - imgHeight) / 2) + a bit down
      let imgTop = 16 + (((contentViewHeight - 36 - 36 - 36 - 16 - 16) - 72) / 2) + 4
      let ixConstraint = NSLayoutConstraint(item: img, attribute: NSLayoutConstraint.Attribute.centerX, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.centerX, multiplier: 1, constant: 0)
      let itConstraint = NSLayoutConstraint(item: img, attribute: NSLayoutConstraint.Attribute.top, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.top, multiplier: 1, constant: CGFloat(imgTop))
      contentView.addConstraints([ixConstraint, itConstraint])

      let text = UILabel()
      text.font = self.normalTextBase
      text.textColor = self.gray600
      text.textAlignment = NSTextAlignment.center
      text.text = "No link found to save to Brace"
      text.numberOfLines = 2
      text.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(text)

      let tlConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.left, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.left, multiplier: 1, constant: 16)
      let trConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.right, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.right, multiplier: 1, constant: -16)
      let tbConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: (-16 + -36 + -8))
      let thConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: 60)
      contentView.addConstraints([tlConstraint, trConstraint, tbConstraint, thConstraint])

      let btn = UIButton()
      btn.backgroundColor = .clear
      btn.setTitleColor(self.gray500, for: .normal)
      btn.setAttributedTitle(NSMutableAttributedString(string: "Close", attributes: [NSAttributedString.Key.font: self.normalTextSm]), for: .normal)
      btn.addTarget(self, action: #selector(self.completeRequest), for: .touchUpInside)
      btn.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(btn)

      let blConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.left, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.left, multiplier: 1, constant: 16)
      let brConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.right, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.right, multiplier: 1, constant: -16)
      let bbConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: -16)
      let bhConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: 36)
      contentView.addConstraints([blConstraint, brConstraint, bbConstraint, bhConstraint])

      self._render(contentView)
    }
  }

  private func renderError() {
    DispatchQueue.main.async {
      let contentView = UIView()

      let contentViewWidth = 288, contentViewHeight = 352
      let cwConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.width, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: CGFloat(contentViewWidth))
      let chConstraint = NSLayoutConstraint(item: contentView, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: CGFloat(contentViewHeight))
      contentView.addConstraints([cwConstraint, chConstraint])

      let img = UIImageView(image: UIImage(named: "RedExclamation"))
      img.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(img)

      // imgTop = paddingTop + (((contentViewHeight - btnHeight - textHeight - headHeight - spaceBtwTextAndBtn - spaceBtwHeadAndText - paddingTop - paddingBottom) - imgHeight) / 2)
      let imgTop = 16 + (((contentViewHeight - 36 - 72 - 60 - 16 - 8 - 16 - 16) - 72) / 2)
      let ixConstraint = NSLayoutConstraint(item: img, attribute: NSLayoutConstraint.Attribute.centerX, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.centerX, multiplier: 1, constant: 0)
      let itConstraint = NSLayoutConstraint(item: img, attribute: NSLayoutConstraint.Attribute.top, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.top, multiplier: 1, constant: CGFloat(imgTop))
      contentView.addConstraints([ixConstraint, itConstraint])

      let head = UILabel()
      head.font = self.semiBoldTextLg
      head.textColor = self.gray800
      head.textAlignment = NSTextAlignment.center
      head.text = "Oops..., something went wrong!"
      head.numberOfLines = 2
      head.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(head)

      let hlConstraint = NSLayoutConstraint(item: head, attribute: NSLayoutConstraint.Attribute.left, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.left, multiplier: 1, constant: 16)
      let hrConstraint = NSLayoutConstraint(item: head, attribute: NSLayoutConstraint.Attribute.right, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.right, multiplier: 1, constant: -16)
      let hbConstraint = NSLayoutConstraint(item: head, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: (-16 + -36 + -16 + -72 + -8))
      let hhConstraint = NSLayoutConstraint(item: head, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: 60)
      contentView.addConstraints([hlConstraint, hrConstraint, hbConstraint, hhConstraint])

      let text = UILabel()
      text.font = self.normalTextBase
      text.textColor = self.gray500
      text.textAlignment = NSTextAlignment.center
      text.text = "Please wait for a moment and try again. If the problem persists, please contact us."
      text.numberOfLines = 3
      text.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(text)

      let tlConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.left, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.left, multiplier: 1, constant: 16)
      let trConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.right, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.right, multiplier: 1, constant: -16)
      let tbConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: (-16 + -36 + -16))
      let thConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: 72)
      contentView.addConstraints([tlConstraint, trConstraint, tbConstraint, thConstraint])

      let btn = UIButton()
      btn.backgroundColor = .clear
      btn.setTitleColor(self.gray500, for: .normal)
      btn.setAttributedTitle(NSMutableAttributedString(string: "Close", attributes: [NSAttributedString.Key.font: self.normalTextSm]), for: .normal)
      btn.addTarget(self, action: #selector(self.completeRequest), for: .touchUpInside)
      btn.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(btn)

      let blConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.left, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.left, multiplier: 1, constant: 16)
      let brConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.right, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.right, multiplier: 1, constant: -16)
      let bbConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: -16)
      let bhConstraint = NSLayoutConstraint(item: btn, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: 36)
      contentView.addConstraints([blConstraint, brConstraint, bbConstraint, bhConstraint])

      self._render(contentView, pb: -48)
    }
  }
}
