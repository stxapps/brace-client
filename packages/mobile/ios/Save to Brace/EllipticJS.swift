//
//  EllipticJS.swift
//  Blockstack
//
//  Created by Shreyas Thiagaraj on 7/18/18.
//

import Foundation
import JavaScriptCore
import CryptoSwift

open class EllipticJS {
  
  lazy var context: JSContext? = {
    let context = JSContext()
    
    guard let JSPath = Bundle.main.path(forResource: "elliptic", ofType: "js") else {
      print("Unable to read resource files.")
      return nil
    }
    
    do {
      let ellipticJS = try String(contentsOfFile: JSPath, encoding: String.Encoding.utf8)
      _ = context?.evaluateScript(ellipticJS)
      
    } catch (let error) {
      print("Error while processing script file: \(error)")
    }
    
    context?.exceptionHandler = {(context: JSContext?, exception: JSValue?) -> Void in
      print(exception!.toString())
    }
    
    _ = context?.evaluateScript("var console = { log: function(message) { _consoleLog(message) } }")
    
    let consoleLog: @convention(block) (String) -> Void = { message in
      print("console.log: " + message)
    }
    
    context?.setObject(unsafeBitCast(consoleLog, to: AnyObject.self),
                       forKeyedSubscript: "_consoleLog" as NSCopying & NSObjectProtocol)
    
    return context
  }()
  
  public func computeSecret(privateKey: String, publicKey: String) -> String? {
    guard let context = context else {
      print("JSContext not found.")
      return nil
    }
    context.evaluateScript("""
                                 function getHexFromBN(bnInput) {
                                 var hexOut = bnInput.toString('hex');
                                 
                                 if (hexOut.length === 64) {
                                 return hexOut;
                                 } else if (hexOut.length < 64) {
                                 // pad with leading zeros
                                 // the padStart function would require node 9
                                 var padding = '0'.repeat(64 - hexOut.length);
                                 return '' + padding + hexOut;
                                 } else {
                                 throw new Error('Generated a > 32-byte BN for encryption. Failing.');
                                 }
                                 }
                                 """)
    context.evaluateScript("""
                                 const curve = new ec('secp256k1');
                                 const ephemeralSK = curve.keyFromPrivate('\(privateKey)', 'hex');
                                 const ecPK = curve.keyFromPublic('\(publicKey)', 'hex').getPublic();
                                 const sharedSecretBN = ephemeralSK.derive(ecPK);
                                 """)
    let sharedSecretHex = context.evaluateScript("getHexFromBN(sharedSecretBN)")
    return sharedSecretHex?.toString()
  }
  
  public func getPublicKeyFromPrivate(_ privateKey: String, compressed: Bool) -> String? {
    guard let context = self.context else {
      print("JSContext not found.")
      return nil
    }
    context.evaluateScript("""
                                 const curve = new ec('secp256k1');
                                 const publicKey = curve.keyFromPrivate('\(privateKey)', 'hex').getPublic();
                                 """)
    let publicKeyJS = compressed ?
      context.evaluateScript("publicKey.encodeCompressed('hex')") :
      context.evaluateScript("publicKey.encode('hex')")
    return publicKeyJS?.toString()
  }
  
  public func encodeCompressed(publicKey: String) -> String? {
    guard let context = self.context else {
      print("JSContext not found.")
      return nil
    }
    context.evaluateScript("""
                                 const curve = new ec('secp256k1');
                                 const ecPK = curve.keyFromPublic('\(publicKey)', 'hex').getPublic();
                                 """)
    let publicKeyJS = context.evaluateScript("ecPK.encodeCompressed('hex')")
    return publicKeyJS?.toString()
  }
  
  public func getUncompressed(publicKey: String) -> String? {
    guard let context = self.context else {
      print("JSContext not found.")
      return nil
    }
    context.evaluateScript("""
                                 const curve = new ec('secp256k1');
                                 const ecPK = curve.keyFromPublic('\(publicKey)', 'hex').getPublic();
                                 """)
    let publicKeyJS = context.evaluateScript("ecPK.encode('hex')")
    return publicKeyJS?.toString()
  }
  
  public func signECDSA(privateKey: String, content: Bytes) -> SignatureObject? {
    guard let context = self.context else {
      print("JSContext not found.")
      return nil
    }
    context.evaluateScript("const curve = new ec('secp256k1');")
    guard let ecPrivate = context.evaluateScript("curve.keyFromPrivate('\(privateKey)', 'hex')"),
          let signature = ecPrivate.invokeMethod("sign", withArguments: [content.sha256()]),
          let signatureString = signature.invokeMethod("toDER", withArguments: ["hex"])?.toString(),
          let publicKey = Keys.getPublicKeyFromPrivate(privateKey, compressed: true) else {
      return nil
    }
    return SignatureObject(signature: signatureString, publicKey: publicKey, cipherText: nil)
  }
  
  public func verifyECDSA(content: Bytes, publicKey: String, signature: String) -> Bool? {
    guard let context = self.context else {
      print("JSContext not found.")
      return nil
    }
    let contentHash = content.sha256()
    context.evaluateScript("const curve = new ec('secp256k1');")
    guard let ecPublic = context.evaluateScript("curve.keyFromPublic('\(publicKey)', 'hex')") else {
      return nil
    }
    let isSignatureValid = ecPublic.invokeMethod("verify", withArguments: [contentHash, signature])
    return isSignatureValid?.toBool()
  }
}
