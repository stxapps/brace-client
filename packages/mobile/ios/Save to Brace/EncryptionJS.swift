//
//  EncryptionJS.swift
//  Blockstack
//
//  Created by Yukan Liao on 2018-04-15.
//

import Foundation
import JavaScriptCore

open class EncryptionJS {
  lazy var context: JSContext? = {
    let context = JSContext()
    
    guard let JSPath = Bundle.main.path(forResource: "encryption", ofType: "js") else {
      print("Unable to read resource files.")
      return nil
    }
    
    do {
      let encryptionJS = try String(contentsOfFile: JSPath, encoding: String.Encoding.utf8)
      _ = context?.evaluateScript(encryptionJS)
      
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
                       forKeyedSubscript: "_consoleLog" as (NSCopying & NSObjectProtocol)?)
    
    return context
  }()
  
  public func decryptECIES(privateKey: String, cipherObjectJSONString: String) -> DecryptedValue? {
    guard let context = context else {
      print("JSContext not found.")
      return nil
    }
    
    context.evaluateScript("var encryptedObj = JSON.parse('\(cipherObjectJSONString)')")
    guard let plainText = context.evaluateScript("encryption.decryptECIES('\(privateKey)', encryptedObj)"), !plainText.isUndefined else {
      return nil
    }
    
    if plainText.isString {
      return DecryptedValue(text: plainText.toString())
    } else if let ptr = JSObjectGetTypedArrayBytesPtr(context.jsGlobalContextRef, plainText.jsValueRef, nil) {
      let count = JSObjectGetTypedArrayByteLength(context.jsGlobalContextRef, plainText.jsValueRef, nil)
      let typedPtr = ptr.bindMemory(to: UInt8.self, capacity: count)
      let bufferPointer = UnsafeBufferPointer(start: typedPtr, count: count)
      let bytes = Bytes(bufferPointer)
      return DecryptedValue(bytes: bytes)
    } else {
      return nil
    }
  }
}

