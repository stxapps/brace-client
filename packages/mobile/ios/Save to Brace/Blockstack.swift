//
//  Blockstack.swift
//  Save to Brace
//
//  Created by Mac on 9/6/21.
//

import Foundation

class Blockstack {
  
  public static let shared = Blockstack()
  
  public func isUserSignedIn() -> Bool {
    return self.getUserData() != nil
  }
  
  public func addLink(url: String, callback: @escaping (_ publicUrl: String?, _ error: Error?) -> Void) {
    
    let listName = MY_LIST
    
    let addedDT = Int64((Date().timeIntervalSince1970 * 1000.0).rounded())
    let id = "\(addedDT)-\(randomString(4))-\(randomString(4))"
    let decor = randomDecor(getUrlFirstChar(url))
    
    let fpath = "links/\(listName)/\(id).json"
    let content = "{\"id\": \"\(id)\", \"url\": \"\(url)\", \"addedDT\": \(addedDT), \"decor\": \(decor)}"

    self.putFile(path: fpath, content: content, contentType: "application/json", callback: callback)
  }

  private let defaultGaiaHubUrl = "https://hub.blockstack.org"
  private let userDefaults = UserDefaults(suiteName: APP_GROUP_SHARE)  
  private var userData: UserData?
  private var gaiaConfig: GaiaConfig?

  private func getUserData() -> UserData? {
    if let uData = self.userData {
      return uData
    }

    let uData = self.retrieveUserData()
    self.userData = uData
    return uData
  }

  private func retrieveUserData() -> UserData? {
    guard let s = userDefaults?.string(forKey: APP_GROUP_SHARE_UKEY),
          let d = s.data(using: .utf8),
          let uData = try? JSONDecoder().decode(UserData.self, from: d) else {
      return nil
    }
    return uData
  }

  private func getGaiaConfig(callback: @escaping (GaiaConfig?, Error?) -> Void) {
    if let config = self.gaiaConfig {
      callback(config, nil)
      return
    }

    if let config = self.retrieveGaiaConfig() {
      self.gaiaConfig = config
      callback(config, nil)
      return
    }

    let userData = self.getUserData()
    let hubUrl = userData?.hubUrl ?? defaultGaiaHubUrl
    guard let appPrivateKey = userData?.privateKey else {
      print("Error not found appPrivateKey in getGaiaConfig")
      callback(nil, NSError.create(description: "Error not found appPrivateKey in getGaiaConfig"))
      return
    }
    self.connectToGaiaHub(hubUrl: hubUrl, challengeSignerHex: appPrivateKey) { config, error in
      guard let config = config, error == nil else {
        callback(nil, error)
        return
      }

      self.saveGaiaConfig(config: config)
      self.gaiaConfig = config
      callback(config, nil)
    }
  }

  private func connectToGaiaHub(hubUrl: String, challengeSignerHex: String, callback: @escaping (GaiaConfig?, Error?) -> Void) {
    self.getGaiaHubInfo(for: hubUrl) { hubInfo, error in
      guard let hubInfo = hubInfo, error == nil else {
        callback(nil, error)
        return
      }

      let bitcoinJS = BitcoinJS()
      let signature = bitcoinJS.signChallenge(privateKey: challengeSignerHex, challengeText: hubInfo.challengeText!)
      let publicKey = Keys.getPublicKeyFromPrivate(challengeSignerHex, compressed: true)
      let tokenObject: [String: Any?] = ["publickey": publicKey, "signature": signature]
      let token = tokenObject.toJsonString()?.encodingToBase64()
      let address = Keys.getAddressFromPublicKey(publicKey!)
      let config = GaiaConfig(UrlPrefix: hubInfo.readUrlPrefix, address: address, token: token, server: hubUrl)
      callback(config, nil)
    }
  }
  
  private func getGaiaHubInfo(for hubUrl: String, callback: @escaping (GaiaHubInfo?, Error?) -> Void) {
    guard let url = URL(string: "\(hubUrl)/hub_info") else {
      print("Error when declare url from hubInfoUrl")
      callback(nil, NSError.create(description: "Error when declare url from hubInfoUrl"))
      return
    }
    
    let task = URLSession.shared.dataTask(with: url) { data, response, error in
      guard let data = data, error == nil else {
        print("Error connecting to Gaia hub")
        callback(nil, error)
        return
      }
      
      guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
        print("Error Gaia hub returns status code other than 2xx")
        callback(nil, NSError.create(description: "Error Gaia hub returns status code other than 2xx"))
        return
      }
      
      do {
        let hubInfo = try JSONDecoder().decode(GaiaHubInfo.self, from: data)
        callback(hubInfo, nil)
      } catch {
        callback(nil, error)
      }
    }
    task.resume()
  }

  private func saveGaiaConfig(config: GaiaConfig) {
    if let config = try? PropertyListEncoder().encode(config) {
      userDefaults?.set(config, forKey: APP_GROUP_SHARE_GKEY)
    }
  }

  private func retrieveGaiaConfig() -> GaiaConfig? {
    guard let d = userDefaults?.value(forKey: APP_GROUP_SHARE_GKEY) as? Data,
          let config = try? PropertyListDecoder().decode(GaiaConfig.self, from: d) else {
      return nil
    }
    return config
  }

  private func encrypt(content: Content) -> Data? {
    guard let privateKey = self.getUserData()?.privateKey else {
      return nil
    }
    let publicKey = Keys.getPublicKeyFromPrivate(privateKey)
    guard let recipientPublicKey = publicKey else {
      return nil
    }

    // Encrypt and serialize to JSON
    var cipherObjectJSON: String?
    switch content {
      case let .bytes(bytes):
        cipherObjectJSON = Encryption.encryptECIES(content: bytes, recipientPublicKey: recipientPublicKey, isString: false)
      case let .text(text):
        cipherObjectJSON = Encryption.encryptECIES(content: text, recipientPublicKey: recipientPublicKey)
    }
    guard let cipher = cipherObjectJSON else {
      return nil
    }

    return cipher.data(using: .utf8)
  }

  private func putFile(
    path: String,
    content: String,
    contentType: String,
    callback: @escaping (_ publicUrl: String?, _ error: Error?) -> Void) {

    guard let data = self.encrypt(content: .text(content)) else {
      print("Encryption error in putFile")
      callback(nil, NSError.create(description: "Encryption error in putFile"))
      return
    }

    self.getGaiaConfig() { config, error in
      guard let config = config, error == nil else {
        callback(nil, error)
        return
      }

      guard let path = path.addingPercentEncoding(withAllowedCharacters: NSCharacterSet.urlPathAllowed),
            let putUrl = URL(string: "\(config.server!)/store/\(config.address!)/\(path)") else {
        print("Error create putUrl in putFile")
        callback(nil, NSError.create(description: "Error create putUrl in putFile"))
        return
      }

      var request = URLRequest(url: putUrl)
      request.httpMethod = "POST"
      request.setValue(contentType, forHTTPHeaderField: "Content-Type")
      request.setValue("bearer \(config.token!)", forHTTPHeaderField: "Authorization")
      request.httpBody = data

      let task = URLSession.shared.dataTask(with: request) { data, response, error in
        guard let data = data, error == nil else {
          print("Error uploading to Gaia hub")
          callback(nil, error)
          return
        }

        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
          print("Error uploading to Gaia hub returns status code other than 2xx")
          callback(nil, NSError.create(description: "Error uploading to Gaia hub returns status code other than 2xx"))
          return
        }
        
        do {
          print("Added with data:")
          print(data)
          let result = try JSONDecoder().decode(PutFileResponse.self, from: data)
          print("Parse result:")
          print(result)
          callback(result.publicUrl!, nil)
        } catch {
          print("Parse putfile response error")
          callback(nil, error)
        }
      }
      task.resume()
    }
  }
  
  private func randomString(_ length: Int) -> String {
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    return String((0..<length).map{ _ in characters.randomElement()!})
  }
  
  private func getUrlFirstChar(_ url: String) -> String {
    guard let url = URL(string: url), let host = url.host else {
      return randomString(1)
    }

    let arr = host.split(separator: ".")
    guard let c = arr[(arr.count - 2)...].first?.first else {
      return randomString(1)
    }
    
    return String(c)
  }

  private func randInt(_ max: Int) -> Int {
    return Int.random(in: 0..<max)
  }

  private func sample(_ arr: [String]) -> String {
    return arr[randInt(arr.count)]
  }
  
  private func randomDecor(_ text: String) -> String {
    var n: Int

    // image background
    var imageBgType: String, imageBgValue: String
    n = randInt(100)
    if (n < 30) {
      imageBgType = COLOR
      imageBgValue = sample(BG_COLOR_STYLES)
    } else if (n < 80) {
      imageBgType = PATTERN
      imageBgValue = sample(PATTERNS)
    } else {
      imageBgType = IMAGE
      imageBgValue = sample(IMAGES)
    }
    let imageBg = "{\"type\": \"\(imageBgType)\", \"value\": \"\(imageBgValue)\"}"

    // image foreground
    var imageFg = "null"
    n = randInt(100)
    if ((imageBgType == COLOR && n < 75) || (imageBgType == PATTERN && n < 25)) {
      imageFg = "{\"text\": \"\(text)\"}"
    }

    // favicon background
    var faviconBgType: String, faviconBgValue: String
    n = randInt(100)
    if (n < 75) {
      faviconBgType = COLOR
      faviconBgValue = sample(BG_COLOR_STYLES)
    } else {
      faviconBgType = PATTERN
      faviconBgValue = sample(PATTERNS)
    }
    let faviconBg = "{\"type\": \"\(faviconBgType)\", \"value\": \"\(faviconBgValue)\"}"

    return "{\"image\": {\"bg\": \(imageBg), \"fg\": \(imageFg)}, \"favicon\": {\"bg\": \(faviconBg)}}"
  }
}
