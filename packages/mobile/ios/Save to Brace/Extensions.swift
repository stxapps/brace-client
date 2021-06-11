//
//  Extensions.swift
//  Blockstack
//
//  Created by Yukan Liao on 2018-04-19.
//

import Foundation
import UIKit

extension Data {
  struct HexEncodingOptions: OptionSet {
    let rawValue: Int
    static let upperCase = HexEncodingOptions(rawValue: 1 << 0)
  }
  
  init?(fromHexEncodedString string: String) {
    // Convert 0 ... 9, a ... f, A ...F to their decimal value,
    // return nil for all other input characters
    func decodeNibble(u: UInt16) -> UInt8? {
      switch(u) {
      case 0x30 ... 0x39:
        return UInt8(u - 0x30)
      case 0x41 ... 0x46:
        return UInt8(u - 0x41 + 10)
      case 0x61 ... 0x66:
        return UInt8(u - 0x61 + 10)
      default:
        return nil
      }
    }
    
    self.init(capacity: string.utf16.count/2)
    var even = true
    var byte: UInt8 = 0
    for c in string.utf16 {
      guard let val = decodeNibble(u: c) else { return nil }
      if even {
        byte = val << 4
      } else {
        byte += val
        self.append(byte)
      }
      even = !even
    }
    guard even else { return nil }
  }
  
  func hexEncodedString(options: HexEncodingOptions = []) -> String {
    let hexDigits = Array((options.contains(.upperCase) ? "0123456789ABCDEF" : "0123456789abcdef").utf16)
    var chars: [unichar] = []
    chars.reserveCapacity(2 * count)
    for byte in self {
      chars.append(hexDigits[Int(byte / 16)])
      chars.append(hexDigits[Int(byte % 16)])
    }
    return String(utf16CodeUnits: chars, count: chars.count)
  }
}

extension Dictionary where Key == String, Value == Any? {
  func toJsonString() -> String? {
    guard let jsonData = try? JSONSerialization.data(withJSONObject: self, options: []) else {
      return nil
    }
    return String(data: jsonData, encoding: String.Encoding.utf8)
  }
}

extension NSError {
  static func create(description: String) -> Error {
    return NSError(domain: "blockstack", code: 0, userInfo: [NSLocalizedDescriptionKey: description])
  }
}

extension String {
  func decodingFromBase64() -> String? {
    guard let data = Data(base64Encoded: self, options: Data.Base64DecodingOptions(rawValue: 0)) else {
      return nil
    }
    return String(data: data as Data, encoding: String.Encoding.utf8)
  }
  
  func encodingToBase64() -> String? {
    guard let data = self.data(using: String.Encoding.utf8) else {
      return nil
    }
    return data.base64EncodedString(options: Data.Base64EncodingOptions(rawValue: 0))
  }
  
  func paddingLeft(to length: Int, with character: Character) -> String {
    return self.count < length ?
      String(repeatElement(character, count: length - self.count)) + self :
      String(self.suffix(length))
  }
}

extension URL {
  public var queryParameters: [String: String]? {
    guard let components = URLComponents(url: self, resolvingAgainstBaseURL: true), let queryItems = components.queryItems else {
      return nil
    }
    var parameters = [String: String]()
    for item in queryItems {
      parameters[item.name] = item.value
    }
    return parameters
  }
}
