//
//  DataTypes.swift
//  Blockstack
//
//  Created by Yukan Liao on 2018-04-12.
//

import Foundation

public typealias Bytes = Array<UInt8>

public struct UserData: Codable {
  public let jti: String?
  public let iat, exp: Int?
  public let iss: String?
  public var privateKey: String?
  public let publicKeys: [String]?
  public let username, profileUrl, hubUrl, version: String?
  public let gaiaAssociationToken: String?

  enum CodingKeys: String, CodingKey {
    case jti, iat, exp, iss
    case privateKey = "private_key"
    case publicKeys = "public_keys"
    case username
    case profileUrl = "profile_url"
    case hubUrl, version
    case gaiaAssociationToken
  }
}

public struct GaiaHubInfo: Codable {
  let challengeText: String?
  let readUrlPrefix: String?
  let latestAuthVersion: String?

  enum CodingKeys: String, CodingKey {
    case challengeText = "challenge_text"
    case readUrlPrefix = "read_url_prefix"
    case latestAuthVersion = "latest_auth_version"
  }
}

public struct GaiaConfig: Codable {
  public let UrlPrefix: String?
  public let address: String?
  public let token: String?
  public let server: String?

  public init(UrlPrefix: String?, address: String?, token: String?, server: String?) {
    self.UrlPrefix = UrlPrefix
    self.address = address
    self.token = token
    self.server = server
  }
}

public struct SignatureObject: Codable {
  public let signature: String
  public let publicKey: String
  public let cipherText: String?
}

public enum Content {
  case text(String)
  case bytes(Bytes)
}

public struct PutFileResponse: Codable {
  let publicUrl: String?

  enum CodingKeys: String, CodingKey {
    case publicUrl = "publicURL"
  }
}
