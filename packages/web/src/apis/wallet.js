import { SECP256K1Client, TokenSigner } from 'jsontokens';
import { parseZoneFile } from 'zone-file';
import { makeDIDFromAddress } from '@stacks/auth/dist/esm'
import {
  generateSecretKey, generateWallet, getRootNode, deriveAccount, makeWalletConfig,
  updateWalletConfigWithApp, getAppPrivateKey, getStxAddress,
} from '@stacks/wallet-sdk/dist/esm';
import {
  DEFAULT_PROFILE, DEFAULT_PROFILE_FILE_NAME, /*signAndUploadProfile,*/
} from '@stacks/wallet-sdk/dist/esm/models/profile';
import { getHubInfo, makeGaiaAssociationToken } from '@stacks/wallet-sdk/dist/esm/utils';
import { TransactionVersion } from '@stacks/transactions/dist/esm';
import {
  randomBytes, hexStringToECPair, ecPairToAddress, decryptContent,
  getPublicKeyFromPrivate, publicKeyToAddress,
} from '@stacks/encryption/dist/esm';
import { fetchPrivate } from '@stacks/common/dist/esm';

import { HR_HUB_URL, SD_HUB_URL } from '../types/const';
import { isObject, isString, isNumber, sleep } from '../utils';

const DEFAULT_PASSWORD = 'password';
const N_ACCOUNTS = 10;

const getHubConfig = (hubUrl, hubInfo, privateKey, associationToken) => {
  const challengeText = hubInfo.challenge_text;
  const iss = getPublicKeyFromPrivate(privateKey);
  const salt = randomBytes(16).toString('hex');
  const payload = {
    gaiaChallenge: challengeText,
    hubUrl,
    iss,
    salt,
    associationToken: associationToken,
  };
  const signedPayload = new TokenSigner('ES256K', privateKey).sign(payload);
  const token = `v1:${signedPayload}`;

  const address = ecPairToAddress(
    hexStringToECPair(privateKey + (privateKey.length === 64 ? '01' : ''))
  );

  return {
    url_prefix: hubInfo.read_url_prefix,
    max_file_upload_size_megabytes: hubInfo.max_file_upload_size_megabytes,
    address,
    token,
    server: hubUrl,
  };
};

/*const storeWalletConfig = async (walletData) => {
  const { appData, wallet } = walletData;
  const { domainName, appName, appIconUrl, appScopes } = appData;

  let { sdHubInfo, sdWalletHubConfig } = walletData;
  if (!isObject(sdHubInfo)) {
    sdHubInfo = await getHubInfo(SD_HUB_URL);
    walletData.sdHubInfo = sdHubInfo;
  }
  if (!isObject(sdWalletHubConfig)) {
    sdWalletHubConfig = getHubConfig(
      SD_HUB_URL, sdHubInfo, wallet.configPrivateKey, null
    );
    walletData.sdWalletHubConfig = sdWalletHubConfig;
  }

  const account = wallet.accounts[0];
  const sdWalletConfig = makeWalletConfig(wallet);
  await updateWalletConfigWithApp({
    wallet,
    account,
    app: {
      origin: domainName,
      scopes: appScopes,
      lastLoginAt: new Date().getTime(),
      appIcon: appIconUrl,
      name: appName,
    },
    gaiaHubConfig: sdWalletHubConfig,
    walletConfig: sdWalletConfig,
  });
  walletData.sdWalletConfig = sdWalletConfig;
};

const storeProfile = async (walletData) => {
  const { wallet } = walletData

  const account = wallet.accounts[0];
  const profile = { ...(account.profile || DEFAULT_PROFILE) };
  profile.api = { ...profile.api, gaiaHubUrl: SD_HUB_URL };
  account.profile = profile;

  let { sdHubInfo, sdProfileHubConfig } = walletData;
  if (!isObject(sdHubInfo)) {
    sdHubInfo = await getHubInfo(SD_HUB_URL);
    walletData.sdHubInfo = sdHubInfo;
  }
  if (!isObject(sdProfileHubConfig)) {
    sdProfileHubConfig = getHubConfig(
      SD_HUB_URL, sdHubInfo, account.dataPrivateKey, null
    );
    walletData.sdProfileHubConfig = sdProfileHubConfig;
  }

  await signAndUploadProfile({
    profile, account, gaiaHubUrl: SD_HUB_URL, gaiaHubConfig: sdProfileHubConfig,
  });
};*/

const createAccount = async (appData) => {
  const secretKey = generateSecretKey(256);
  const wallet = await generateWallet({ secretKey, password: DEFAULT_PASSWORD });

  const walletData = { appData, secretKey, wallet, fromCreateAccount: true };
  //await storeWalletConfig(walletData);
  //await storeProfile(walletData);

  return walletData;
};

const getWalletConfig = async (url_prefix, address, privateKey) => {
  // If server down, throw error. If 404, 403, not found, return null. Else throw error.
  const url = `${url_prefix}${address}/wallet-config.json`;
  const res = await fetchPrivate(url);
  if (res.ok) {
    try {
      const encrypted = await res.text();
      const configJson = /** @type {string} */(await decryptContent(
        encrypted, { privateKey }
      ));
      const walletConfig = JSON.parse(configJson);
      return walletConfig;
    } catch (error) {
      // treat it like no walletConfig i.e. invalid format
      return null;
    }
  }
  if ([403, 404].includes(res.status)) return null;

  throw new Error(`(getWalletConfig) Error ${res.status}`);
};

const deriveNewAccounts = (rootNode, salt, wAccounts, wcAccounts) => {
  if (!Array.isArray(wAccounts) || !Array.isArray(wcAccounts)) return wAccounts;

  const newAccounts = wcAccounts.map((account, index) => {
    let existingAccount = wAccounts[index];
    if (!isObject(existingAccount)) {
      existingAccount = deriveAccount({ rootNode, index, salt });
    }
    return { ...existingAccount };
  });

  return newAccounts;
};

const restoreWalletConfig = async (walletData) => {
  const { wallet } = walletData;

  const rootNode = getRootNode(wallet);
  const salt = wallet.salt;

  let { sdHubInfo, sdWalletHubConfig } = walletData;
  if (!isObject(sdHubInfo)) {
    sdHubInfo = await getHubInfo(SD_HUB_URL);
    walletData.sdHubInfo = sdHubInfo;
  }
  if (!isObject(sdWalletHubConfig)) {
    sdWalletHubConfig = getHubConfig(
      SD_HUB_URL, sdHubInfo, wallet.configPrivateKey, null
    );
    walletData.sdWalletHubConfig = sdWalletHubConfig;
  }

  const sdWalletConfig = await getWalletConfig(
    sdWalletHubConfig.url_prefix, sdWalletHubConfig.address, wallet.configPrivateKey
  );
  if (isObject(sdWalletConfig)) {
    wallet.accounts = deriveNewAccounts(
      rootNode, salt, wallet.accounts, sdWalletConfig.accounts
    );
    walletData.sdWalletConfig = sdWalletConfig;
    return;
  }

  let { hrHubInfo, hrWalletHubConfig } = walletData;
  if (!isObject(hrHubInfo)) {
    hrHubInfo = await getHubInfo(HR_HUB_URL);
    walletData.hrHubInfo = hrHubInfo;
  }
  if (!isObject(hrWalletHubConfig)) {
    hrWalletHubConfig = getHubConfig(
      HR_HUB_URL, hrHubInfo, wallet.configPrivateKey, null
    );
    walletData.hrWalletHubConfig = hrWalletHubConfig;
  }

  const hrWalletConfig = await getWalletConfig(
    hrWalletHubConfig.url_prefix, hrWalletHubConfig.address, wallet.configPrivateKey
  );
  if (isObject(hrWalletConfig)) {
    wallet.accounts = deriveNewAccounts(
      rootNode, salt, wallet.accounts, hrWalletConfig.accounts
    );
    walletData.hrWalletConfig = hrWalletConfig;
    return;
  }
};

const getUsername = async (account) => {
  const stxAddress = getStxAddress({
    account, transactionVersion: TransactionVersion.Mainnet,
  });

  // if server down, need to throw an error to get hubUrl correctly
  const url = `https://api.hiro.so/v1/addresses/stacks/${stxAddress}`;
  const res = await fetchPrivate(url);
  if (res.ok) {
    const json = await res.json();
    if (Array.isArray(json.names) && json.names.length > 0) return json.names[0];
    return null;
  }

  throw new Error(`(getUsername) Error ${res.status}`);
};

const restoreUsernames = async (accounts) => {
  for (let i = 0, j = accounts.length; i < j; i += N_ACCOUNTS) {
    // Hiro usage rate limit is 50 requests per minute (including OPTION).
    if (i !== 0 && i % 20 === 0) await sleep(60 * 1000);

    const _accounts = accounts.slice(i, i + N_ACCOUNTS);
    await Promise.all(_accounts.map(async (account) => {
      account.username = await getUsername(account);
    }));
  }
};

const restoreAccount = async (appData, secretKey) => {
  if (!isString(secretKey)) return { errMsg: 'Please fill in your Secret Key.' };

  let wallet;
  try {
    wallet = await generateWallet({ secretKey, password: DEFAULT_PASSWORD });
  } catch (error) {
    console.log('Error when restore account: ', error);
    return { errMsg: 'Your Secret Key is invaid. Please check and try again.' };
  }

  const walletData = { appData, wallet };
  await restoreWalletConfig(walletData);
  if (walletData.wallet.accounts.length > 1) {
    await restoreUsernames(walletData.wallet.accounts);
  }

  return walletData;
};

const getProfileUrlFromZoneFile = async (name) => {
  // if server down, need to throw an error to get hubUrl correctly
  const url = `https://api.hiro.so/v1/names/${name}`;
  const res = await fetchPrivate(url);
  if (res.ok) {
    const nameInfo = await res.json();
    try {
      const zone = parseZoneFile(nameInfo.zonefile);
      const target = zone.uri[0].target;
      if (isString(target) && target.length > 0) return target;
    } catch (error) {
      // Invalid zonefile format, return null.
    }
    return null;
  }
  // should not happen as just get the username from the API
  if ([403, 404].includes(res.status)) return null;

  throw new Error(`(getProfileUrlFromZoneFile) Error ${res.status}`);
};

const restoreProfile = async (walletData, accountIndex) => {
  const { wallet } = walletData;
  const account = wallet.accounts[accountIndex];

  // If already done in restoreUsernames, there will be attr:username in account.
  //   It can be null so need to use in.
  if (!('username' in account)) account.username = await getUsername(account);

  let url;
  if (isString(account.username)) {
    url = await getProfileUrlFromZoneFile(account.username);
    if (isString(url)) {
      const res = await fetchPrivate(url);
      if (res.ok) {
        try {
          const json = await res.json();
          const { decodedToken } = json[0];
          account.profile = decodedToken.payload.claim;
          return;
        } catch (error) {
          // Invalid profile format, try below.
        }
      } else if ([403, 404].includes(res.status)) {
        // Not found profile, try below.
      } else {
        throw new Error(`(restoreProfile) Error ${res.status}`);
      }
    }
  }

  let { sdHubInfo } = walletData;
  if (!isObject(sdHubInfo)) {
    sdHubInfo = await getHubInfo(SD_HUB_URL);
    walletData.sdHubInfo = sdHubInfo;
  }

  const publicKey = getPublicKeyFromPrivate(account.dataPrivateKey);
  const address = publicKeyToAddress(publicKey);

  url = `${sdHubInfo.read_url_prefix}${address}/${DEFAULT_PROFILE_FILE_NAME}`;

  const res = await fetchPrivate(url);
  if (res.ok) {
    try {
      const json = await res.json();
      const { decodedToken } = json[0];
      account.profile = decodedToken.payload.claim;
      return;
    } catch (error) {
      // Invalid profile format, treat it like no profile.
    }
  } else if ([403, 404].includes(res.status)) {
    // Not found profile, use the default one.
  } else {
    throw new Error(`(restoreProfile) Error ${res.status}`);
  }
};

const doUseBefore = (walletConfig, appDomain, accountIndex = null) => {
  if (!isObject(walletConfig)) return false;

  try {
    if (isNumber(accountIndex)) {
      const acc = walletConfig.accounts[accountIndex];
      for (const k in acc.apps) {
        if (k === appDomain) return true;
      }
    } else {
      for (const acc of walletConfig.accounts) {
        for (const k in acc.apps) {
          if (k === appDomain) return true;
        }
      }
    }
  } catch (error) {
    console.log('doUseBefore error:', error);
  }

  return false;
};

const updateWalletConfig = async (walletData, accountIndex, hubUrl) => {
  const { appData, wallet } = walletData;
  const { domainName, appName, appIconUrl, appScopes } = appData;

  // Update walletConfig only if
  //   1. Not found anywhere, create to hubUrl
  //   2. Use StacksDrive hub but not found walletConfig in it
  //   3. Do not use before
  const { sdWalletConfig, hrWalletConfig } = walletData;

  const account = wallet.accounts[accountIndex];

  let walletConfig, updateUrl;
  if (isObject(sdWalletConfig)) {
    walletConfig = sdWalletConfig;

    const didUse = doUseBefore(walletConfig, domainName, accountIndex);
    if (!didUse) updateUrl = SD_HUB_URL;
  } else if (isObject(hrWalletConfig)) {
    walletConfig = hrWalletConfig;
    if (hubUrl === SD_HUB_URL) {
      updateUrl = SD_HUB_URL;
    } else {
      const didUse = doUseBefore(walletConfig, domainName, accountIndex);
      if (!didUse) updateUrl = HR_HUB_URL;
    }
  } else {
    walletConfig = makeWalletConfig(wallet);
    if (hubUrl === SD_HUB_URL) updateUrl = SD_HUB_URL;
    else updateUrl = HR_HUB_URL;
  }

  if (isObject(walletConfig) && isString(updateUrl)) {
    let { sdHubInfo, sdWalletHubConfig, hrHubInfo, hrWalletHubConfig } = walletData;

    let walletHubConfig;
    if (updateUrl === SD_HUB_URL) {
      if (!isObject(sdHubInfo)) {
        sdHubInfo = await getHubInfo(SD_HUB_URL);
        walletData.sdHubInfo = sdHubInfo;
      }
      if (!isObject(sdWalletHubConfig)) {
        sdWalletHubConfig = getHubConfig(
          SD_HUB_URL, sdHubInfo, wallet.configPrivateKey, null
        );
        walletData.sdWalletHubConfig = sdWalletHubConfig;
      }
      walletHubConfig = sdWalletHubConfig;
    } else if (updateUrl === HR_HUB_URL) {
      if (!isObject(hrHubInfo)) {
        hrHubInfo = await getHubInfo(HR_HUB_URL);
        walletData.hrHubInfo = hrHubInfo;
      }
      if (!isObject(hrWalletHubConfig)) {
        hrWalletHubConfig = getHubConfig(
          HR_HUB_URL, hrHubInfo, wallet.configPrivateKey, null
        );
        walletData.hrWalletHubConfig = hrWalletHubConfig;
      }
      walletHubConfig = hrWalletHubConfig;
    } else {
      console.log('Invalid updateUrl:', updateUrl);
      return;
    }

    await updateWalletConfigWithApp({
      wallet,
      account,
      app: {
        origin: domainName,
        scopes: appScopes,
        lastLoginAt: new Date().getTime(),
        appIcon: appIconUrl,
        name: appName,
      },
      gaiaHubConfig: walletHubConfig,
      walletConfig: walletConfig,
    });
  }
};

const chooseAccount = async (walletData, accountIndex) => {
  const { appData, wallet, fromCreateAccount } = walletData;

  if (!fromCreateAccount) await restoreProfile(walletData, accountIndex);

  const account = wallet.accounts[accountIndex];

  const publicKey = SECP256K1Client.derivePublicKey(account.dataPrivateKey);
  const address = publicKeyToAddress(publicKey);
  const did = makeDIDFromAddress(address);

  const appPrivateKey = getAppPrivateKey({ account, appDomain: appData.domainName });

  const compressedAppPublicKey = getPublicKeyFromPrivate(appPrivateKey.slice(0, 64));
  const associationToken = makeGaiaAssociationToken({
    privateKey: account.dataPrivateKey,
    childPublicKeyHex: compressedAppPublicKey,
  });

  let hubUrl = HR_HUB_URL;
  if (
    isObject(account.profile) &&
    isObject(account.profile.api) &&
    isString(account.profile.api.gaiaHubUrl)
  ) {
    hubUrl = account.profile.api.gaiaHubUrl;
  }

  if (!fromCreateAccount) await updateWalletConfig(walletData, accountIndex, hubUrl);

  const userData = {
    username: account.username || '',
    email: null,
    profile: { ...(account.profile || DEFAULT_PROFILE), stxAddress: {} },
    decentralizedID: did,
    identityAddress: address,
    appPrivateKey: appPrivateKey,
    coreSessionToken: null,
    authResponseToken: null,
    hubUrl: hubUrl,
    coreNode: null,
    gaiaAssociationToken: associationToken,
  };

  return userData;
};

const wallet = { createAccount, restoreAccount, chooseAccount };

export default wallet;
