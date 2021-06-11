//
//  KeysJS.swift
//  Blockstack
//
//  Created by Yukan Liao on 2018-04-10.
//

import Foundation
import JavaScriptCore

open class KeysJS {
  
  lazy var context: JSContext? = {
    let context = JSContext()
    
    guard let JSPath = Bundle.main.path(forResource: "keys", ofType: "js") else {
      print("Unable to read resource files.")
      return nil
    }
    
    do {
      let keysJS = try String(contentsOfFile: JSPath, encoding: String.Encoding.utf8)
      _ = context?.evaluateScript(keysJS)
      
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
  
  public func getPublicKeyFromPrivate(_ privateKey: String) -> String? {
    guard let context = context else {
      print("JSContext not found.")
      return nil
    }
    let publicKey = context.evaluateScript("keys.getPublicKeyFromPrivate('\(privateKey)')")
    return publicKey?.toString()
  }
  
  public func getAddressFromPublicKey(_ publicKey: String) -> String? {
    guard let context = context else {
      print("JSContext not found.")
      return nil
    }
    let address = context.evaluateScript("keys.publicKeyToAddress('\(publicKey)')")
    return address?.toString()
  }
}
