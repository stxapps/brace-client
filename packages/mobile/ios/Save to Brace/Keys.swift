//
//  Keys.swift
//  Blockstack
//
//  Created by Yukan Liao on 2018-03-27.
//

import Foundation

enum secp256k1Curve {
  static let p = "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"
  static let a = "00"
  static let b = "07"
  static let n = "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"
  static let h = "01"
  static let Gx = "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
  static let Gy = "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
}

/**
 A helper class for cryoptgraphic key operations.
 */
public class Keys {
  
  /**
   Generates a string from a set of random bytes.
   - parameter numberOfBytes: Byte count of the resulting hex string.
   - returns: Hex string cmoprised of random bytes of the given length.
   */
  @objc public static func getEntropy(numberOfBytes: Int = 32) -> String? {
    var randomData = Data(count: numberOfBytes)
    let count = randomData.count
    let result = randomData.withUnsafeMutableBytes {
      SecRandomCopyBytes(kSecRandomDefault, count, $0)
    }
    if result == errSecSuccess {
      return randomData.hexEncodedString()
    } else {
      print("Problem generating random bytes")
      return nil
    }
  }
  
  /**
   Get the associated public key from a given private key on the secp256k1 elliptic curve.
   - parameter privateKey: The private key from which to derive the public key.
   - parameter compressed: Boolean indicating whether the returned public key should be compressed.
   - returns: Complementing, optionally compressed public key for given private key.
   */
  @objc public static func getPublicKeyFromPrivate(_ privateKey: String, compressed: Bool = false) -> String? {
    return EllipticJS().getPublicKeyFromPrivate(privateKey, compressed: compressed)
  }
  
  /**
   Generate an elliptic curve private key for secp256k1.
   */
  @objc public static func makeECPrivateKey() -> String? {
    let keyLength = 32
    let n = secp256k1Curve.n
    let nBigInt = _BigInt<UInt>(n, radix: 16)
    var d: _BigInt<UInt>?
    
    repeat {
      let randomBytes = self.getEntropy()
      d = _BigInt<UInt>(randomBytes!, radix: 16)
    } while (d!.isNegative
              || d!.isZero
              || d?._compare(to: nBigInt!) == .equal
              || d?._compare(to: nBigInt!) == .greaterThan)
    
    return d?.toString(radix: 16, lowercase: true).paddingLeft(to: keyLength * 2, with: "0")
  }
  
  /**
   Get the corresponding address from a public key.
   */
  @objc public static func getAddressFromPublicKey(_ publicKey: String) -> String? {
    return KeysJS().getAddressFromPublicKey(publicKey)
  }
  
  /**
   Derive a shared cryptographic secret from the specified keys. Typically, this is used between a newly generated, temporary key and a previously known publicKey to create an encryption key.
   */
  @objc public static func deriveSharedSecret(ephemeralSecretKey: String, recipientPublicKey: String) -> String? {
    return EllipticJS().computeSecret(privateKey: ephemeralSecretKey, publicKey: recipientPublicKey)
  }
  
  /**
   Get the compressed version of the specified publicKey.
   */
  @objc public static func getCompressed(publicKey: String) -> String? {
    return EllipticJS().encodeCompressed(publicKey: publicKey)
  }
  
  /**
   Get the uncompressed version of the specified publicKey.
   */
  @objc public static func getUncompressed(publicKey: String) -> String? {
    return EllipticJS().getUncompressed(publicKey: publicKey)
  }
}
