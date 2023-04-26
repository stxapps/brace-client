//
//  JSONToken.swift
//  Blockstack
//
//  Created by Yukan Liao on 2018-03-28.
//

import Foundation
import JavaScriptCore

open class JSONTokensJS {
  
  lazy var context: JSContext? = {
    let context = JSContext()
    
    guard let JSONTokenJSPath = Bundle.main.path(forResource: "jsontokens", ofType: "js") else {
      print("Unable to read resource files.")
      return nil
    }
    
    do {
      let testJS = try String(contentsOfFile: JSONTokenJSPath, encoding: String.Encoding.utf8)
      _ = context?.evaluateScript(testJS)
      
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
  
  public func signToken(payload: [String: Any], privateKey: String, algorithm: String = "ES256K") -> String? {
    guard let context = self.context else {
      print("JSContext not found.")
      return nil
    }
    
    context.setObject(payload, forKeyedSubscript: "jsonTokenPayload" as NSCopying & NSObjectProtocol)
    context.evaluateScript("var tokenSigner = new jsontokens.TokenSigner('ES256K', '\(privateKey)')")
    let token: JSValue = context.evaluateScript("tokenSigner.sign(jsonTokenPayload)")
    return token.toString()
  }
  
  public func decodeToken(token: String) -> String? {
    guard let context = self.context else {
      print("JSContext not found.")
      return nil
    }
    
    context.evaluateScript("var decodedToken = jsontokens.decodeToken('\(token)')")
    let decodedTokenJsonString: JSValue = context.evaluateScript("JSON.stringify(decodedToken)")
    let jsonData = decodedTokenJsonString.toString()
    
    return jsonData
  }
  
  public func verifyToken(token: String, algorithm: String, publicKey: String) -> Bool? {
    guard let context = self.context else {
      print("JSContext not found.")
      return nil
    }
    context.evaluateScript("var tokenVerifier = new jsontokens.TokenVerifier('\(algorithm)', '\(publicKey)')")
    let tokenVerified = context.evaluateScript("tokenVerifier.verify('\(token)')")
    return tokenVerified?.toBool()
  }
  
}
