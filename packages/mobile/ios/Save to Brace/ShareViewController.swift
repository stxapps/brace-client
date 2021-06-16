import UIKit
import MobileCoreServices
import NVActivityIndicatorView

class ShareViewController: UIViewController {

  let urlContentType = kUTTypeURL as String
  var sharedUrls: [String] = []
  var didRenderAdded = false
  var timer: Timer? = nil

  let normalTextBase = UIFont.init(name: "Inter-Regular", size: 16)!
  let normalTextXl = UIFont.init(name: "Inter-Regular", size: 20)!
  let boldTextXl = UIFont.init(name: "Inter-Bold", size: 20)!
  
  let gray900 = UIColor.init(red: 26/255, green: 32/255, blue: 44/255, alpha: 1)
  let gray600 = UIColor.init(red: 113/255, green: 128/255, blue: 150/255, alpha: 1)

  let SM_WIDTH = CGFloat(640)
  
  override func viewDidLoad() {
    super.viewDidLoad()
    self.renderAdding()
  }
  
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    print("viewDidAppear: start process shared data")
    /*DispatchQueue.global(qos: .userInitiated).async {
      self.processRequest()
    }*/
    self.renderAdded()
    //self.renderDiedAdding()
    //self.renderNotSignedIn()
    //self.renderInvalid()
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    if let t = self.timer {
      t.invalidate()
      self.timer = nil
    }
  }

  private func processRequest() {
    guard let inputItems = self.extensionContext?.inputItems, inputItems.count > 0,
          let inputItem = inputItems[0] as? NSExtensionItem,
          let attachments = inputItem.attachments, attachments.count > 0 else {
      self.renderInvalid()
      return
    }
    
    for (_, attachment) in attachments.enumerated() {
      if !attachment.hasItemConformingToTypeIdentifier(urlContentType) {
        self.renderInvalid()
        return
      }

      attachment.loadItem(forTypeIdentifier: urlContentType, options: nil) { [unowned self] data, error in
        guard let url = data as? URL, error == nil else {
          self.renderInvalid()
          return
        }

        self.sharedUrls.append(url.absoluteString)
        if self.sharedUrls.count == attachments.count {
          self.addLink()
        }
      }
    }
  }

  private func addLink() {
    print("in addLink")
    guard self.sharedUrls.count > 0 else {
      self.renderInvalid()
      return
    }

    if !Blockstack.shared.isUserSignedIn() {
      print("userData is nil, show not sign in here")
      // Not sign in
      self.renderNotSignedIn()
      return
    }
    
    print("Found userData, call addLink")
    // Support only 1 url for now!
    Blockstack.shared.addLink(url: self.sharedUrls[0]) { publicUrl, error in
      print("publicUrl")
      print(publicUrl)
      print("error")
      print(error)
      guard let _ = publicUrl, error == nil else {
        self.renderDiedAdding()
        return
      }
      
      self.renderAdded()
    }
  }

  @objc private func completeRequest() {
    print("completeRequest called")
    self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
  }

  @objc private func cancelRequest() {
    print("cancelRequest called")
    self.extensionContext!.cancelRequest(withError: NSError(domain:"BRACEDOTTO_ERROR",
                                                            code: 0,
                                                            userInfo: nil))
  }

  @objc private func onBackgroundBtnClick() {
    print("onBackgroundBtnClick called")
    print(self.didRenderAdded)
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

      let loader = NVActivityIndicatorView(frame: CGRect.init(x: 0, y: 0, width: 72, height: 72), type: .ballPulse, color: self.gray600, padding: 8)
      loader.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(loader)

      // loaderTop = paddingTop + (((contentViewHeight - textHeight - paddingTop - paddingBottom) - loaderHeight) / 2)
      let loaderTop = 16 + (((contentViewHeight - 36 - 16 - 16) - 72) / 2)
      let lxConstraint = NSLayoutConstraint(item: loader, attribute: NSLayoutConstraint.Attribute.centerX, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.centerX, multiplier: 1, constant: 0)
      let ltConstraint = NSLayoutConstraint(item: loader, attribute: NSLayoutConstraint.Attribute.top, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.top, multiplier: 1, constant: CGFloat(loaderTop))
      contentView.addConstraints([lxConstraint, ltConstraint])

      let text = UILabel()
      text.font = self.normalTextXl
      text.textColor = self.gray900
      text.textAlignment = NSTextAlignment.center
      text.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(text)

      let s = NSMutableAttributedString(string: "Saving to ")
      s.append(NSMutableAttributedString(string: "Brace", attributes: [NSAttributedString.Key.font: self.boldTextXl]))
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
      print("Succeed addLink, display green check here and timer to hide")
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
      text.font = self.normalTextXl
      text.textColor = self.gray900
      text.textAlignment = NSTextAlignment.center
      text.translatesAutoresizingMaskIntoConstraints = false
      contentView.addSubview(text)

      let s = NSMutableAttributedString(string: "Saved to ")
      s.append(NSMutableAttributedString(string: "Brace", attributes: [NSAttributedString.Key.font: self.boldTextXl]))
      text.attributedText = s
      
      let tlConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.left, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.left, multiplier: 1, constant: 16)
      let trConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.right, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.right, multiplier: 1, constant: -16)
      let tbConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.bottom, relatedBy: NSLayoutConstraint.Relation.equal, toItem: contentView, attribute: NSLayoutConstraint.Attribute.bottom, multiplier: 1, constant: -16)
      let thConstraint = NSLayoutConstraint(item: text, attribute: NSLayoutConstraint.Attribute.height, relatedBy: NSLayoutConstraint.Relation.equal, toItem: nil, attribute: NSLayoutConstraint.Attribute.notAnAttribute, multiplier: 1, constant: 36)
      contentView.addConstraints([tlConstraint, trConstraint, tbConstraint, thConstraint])

      self._render(contentView)
      self.didRenderAdded = true
      if self.timer == nil {
        print("Set timer")
        self.timer = Timer.scheduledTimer(withTimeInterval: 2, repeats: false) { _ in
          print("Timer fired")
          self.completeRequest()
        }
      }
    }
  }
  
  private func renderDiedAdding() {
    DispatchQueue.main.async {
      print("Error addLink, display error here.")
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
      head.font = self.normalTextXl
      head.textColor = self.gray900
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
      text.textColor = self.gray900
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
      btn.setTitleColor(self.gray900, for: .normal)
      btn.setAttributedTitle(NSMutableAttributedString(string: "Close", attributes: [NSAttributedString.Key.font: self.normalTextBase]), for: .normal)
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

  private func renderInvalid() {
    DispatchQueue.main.async {
      print("Render invalid")
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
      text.font = self.normalTextXl
      text.textColor = self.gray900
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
      btn.setTitleColor(self.gray900, for: .normal)
      btn.setAttributedTitle(NSMutableAttributedString(string: "Close", attributes: [NSAttributedString.Key.font: self.normalTextBase]), for: .normal)
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

  private func renderNotSignedIn() {
    DispatchQueue.main.async {
      print("Not signed in yet, display please sign in")
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
      text.font = self.normalTextXl
      text.textColor = self.gray900
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
      btn.setTitleColor(self.gray900, for: .normal)
      btn.setAttributedTitle(NSMutableAttributedString(string: "Close", attributes: [NSAttributedString.Key.font: self.normalTextBase]), for: .normal)
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
}
