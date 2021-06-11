//
//  Encryption.swift
//  Blockstack
//
//  Created by Yukan Liao on 2018-04-15.
//

import Foundation
import CryptoSwift

class Encryption {
  
  static func decryptPrivateKey(privateKey: String, hexedEncrypted: String) -> String? {
    let encryptedData = Data(fromHexEncodedString: hexedEncrypted)
    let cipherObjectJSONString = String(data: encryptedData!, encoding: .utf8)
    let encryptionJS = EncryptionJS()
    return encryptionJS.decryptECIES(privateKey: privateKey, cipherObjectJSONString: cipherObjectJSONString!)?.plainText
  }
  
  static func encryptECIES(content: Bytes, recipientPublicKey: String, isString: Bool) -> String? {
    guard let ephemeralSK = Keys.makeECPrivateKey(),
          let sharedSecret = Keys.deriveSharedSecret(ephemeralSecretKey: ephemeralSK, recipientPublicKey: recipientPublicKey) else {
      return nil
    }
    let data = Bytes(hex: sharedSecret)
    let hashedSecretBytes = data.sha512()
    let encryptionKey = Array(hashedSecretBytes.prefix(32))
    let hmacKey = Array(hashedSecretBytes.suffix(from: 32))
    let initializationVector = AES.randomIV(16)
    do {
      let aes = try AES(key: encryptionKey, blockMode: CBC(iv: initializationVector))
      let cipherText = try aes.encrypt(content)
      guard let compressedEphemeralPKHex = Keys.getPublicKeyFromPrivate(ephemeralSK, compressed: true) else {
        return nil
      }
      let compressedEphemeralPKBytes = Bytes(hex: compressedEphemeralPKHex)
      let macData = initializationVector + compressedEphemeralPKBytes + cipherText
      let mac = try HMAC(key: hmacKey, variant: .sha256).authenticate(macData)
      let cipherObject: [String: Any?] = [
        "iv": initializationVector.toHexString(),
        "ephemeralPK": compressedEphemeralPKHex,
        "cipherText": Data(bytes: cipherText).hexEncodedString(),
        "mac": mac.toHexString(),
        "wasString": isString
      ]
      return cipherObject.toJsonString()
    } catch {
      // TODO
    }
    return nil
  }
  
  static func encryptECIES(content: String, recipientPublicKey: String) -> String? {
    return self.encryptECIES(content: Array(content.utf8), recipientPublicKey: recipientPublicKey, isString: true)
  }
  
  static func decryptECIES(cipherObjectJSONString: String, privateKey: String) -> DecryptedValue? {
    return EncryptionJS().decryptECIES(privateKey: privateKey, cipherObjectJSONString: cipherObjectJSONString)
  }
}

public struct DecryptedValue {
  public let plainText: String?
  public let bytes: Bytes?
  
  public var isString: Bool {
    return self.plainText != nil
  }
  
  init(text: String) {
    self.plainText = text
    self.bytes = nil
  }
  
  init(bytes: Bytes) {
    self.bytes = bytes
    self.plainText = nil
  }
}

