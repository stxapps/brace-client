import { SECP256K1Client } from 'jsontokens';
import { parseZoneFile } from 'zone-file';
import { makeDIDFromAddress } from '@stacks/auth/dist/esm'
import {
  generateSecretKey, generateWallet, getRootNode, deriveAccount, makeWalletConfig,
  updateWalletConfigWithApp, getAppPrivateKey, getStxAddress,
} from '@stacks/wallet-sdk/dist/esm';
import { DEFAULT_PROFILE } from '@stacks/wallet-sdk/dist/esm/models/profile';
import {
  getHubInfo, connectToGaiaHubWithConfig, makeGaiaAssociationToken,
} from '@stacks/wallet-sdk/dist/esm/utils';
import { TransactionVersion } from '@stacks/transactions/dist/esm';
import {
  decryptContent, getPublicKeyFromPrivate, publicKeyToAddress,
} from '@stacks/encryption/dist/esm';
import { fetchPrivate } from '@stacks/common/dist/esm';

const DEFAULT_PASSWORD = 'password';

const BS_HUB_URL = 'https://hub.blockstack.org';
const HR_HUB_URL = 'https://hub.hiro.so';
const SD_HUB_URL = 'https://hub.stacksdrive.com';

const N_ACCOUNTS = 10;

const createAccount = async () => {
  const secretKey = generateSecretKey(256);
  const wallet = await generateWallet({ secretKey, password: DEFAULT_PASSWORD });

  return { secretKey, wallet };
};

const getHubConfig = async (privateKey, hubUrl) => {
  // if server down, throw error.
  const hubInfo = await getHubInfo(hubUrl);
  const hubConfig = connectToGaiaHubWithConfig({
    hubInfo: hubInfo,
    privateKey: privateKey,
    gaiaHubUrl: hubUrl,
  });

  return hubConfig;
};

const _getWalletConfig = async (wallet, hubUrl) => {
  const walletHubConfig = await getHubConfig(wallet.configPrivateKey, hubUrl);

  // If server down, throw error. If 404, 403, not found, return null. Else throw error.
  const { url_prefix, address } = walletHubConfig;
  const url = `${url_prefix}${address}/wallet-config.json`;
  const res = await fetchPrivate(url);
  if (res.ok) {
    const encrypted = await res.text();
    const configJson = /** @type {string} */(await decryptContent(
      encrypted, { privateKey: wallet.configPrivateKey }
    ));
    const walletConfig = JSON.parse(configJson);
    return { walletConfig, walletHubConfig };
  }
  if ([403, 404].includes(res.status)) return { walletConfig: null, walletHubConfig };

  throw new Error('Network error when fetching walletConfig');
};

const getWalletConfig = async (wallet) => {
  let result = await _getWalletConfig(wallet, SD_HUB_URL);
  if (result.walletConfig) return result;

  const sdWalletHubConfig = result.walletHubConfig;

  result = await _getWalletConfig(wallet, HR_HUB_URL);
  if (result.walletConfig) return result;

  result = await _getWalletConfig(wallet, BS_HUB_URL);
  if (result.walletConfig) return result;

  // if not found, walletHubConfig points to SD_HUB_URL for default in profile lookup.
  return { walletConfig: null, walletHubConfig: sdWalletHubConfig };
};

const restoreWalletConfig = async (wallet) => {
  const rootNode = getRootNode(wallet);
  const salt = wallet.salt;

  const { walletConfig, walletHubConfig } = await getWalletConfig(wallet);
  if (walletConfig && Array.isArray(walletConfig.accounts)) {
    const newAccounts = walletConfig.accounts.map((account, index) => {
      let existingAccount = wallet.accounts[index];
      if (!existingAccount) {
        existingAccount = deriveAccount({ rootNode, index, salt });
      }
      return { ...existingAccount };
    });

    wallet = { ...wallet, accounts: newAccounts };
  }

  return { wallet, walletConfig, walletHubConfig };
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

  throw new Error('Network error when restoring username');
};

const restoreUsernames = async (wallet) => {
  for (let i = 0, j = wallet.accounts.length; i < j; i += N_ACCOUNTS) {
    const _accounts = wallet.accounts.slice(i, i + N_ACCOUNTS);
    await Promise.all(_accounts.map(async (account) => {
      account.username = await getUsername(account);
    }));
  }

  return wallet;
};

const restoreAccount = async (secretKey) => {
  if (!secretKey) return { errMsg: 'Please fill in your Secret Key.' };

  let wallet;
  try {
    wallet = await generateWallet({ secretKey, password: DEFAULT_PASSWORD });
  } catch (error) {
    console.log('Error when restore account: ', error);
    return { errMsg: 'Your Secret Key is invaid. Please check and try again.' };
  }

  const walletData = await restoreWalletConfig(wallet);
  if (walletData.wallet.accounts.length > 1) {
    walletData.wallet = await restoreUsernames(walletData.wallet);
  }

  return walletData;
};

const getProfileUrlFromZoneFile = async (name) => {
  // if server down, need to throw an error to get hubUrl correctly
  const url = `https://api.hiro.so/v1/names/${name}`;
  const res = await fetchPrivate(url);
  if (res.ok) {
    const nameInfo = await res.json();
    const zone = parseZoneFile(nameInfo.zonefile);
    return zone.uri[0].target;
  }
  // should not happen as just get the username from the API
  if (res.status === 404) return null;

  throw new Error('Network error when getting profileUrl from zoneFile');
};

const getProfileUrl = async (account, hubReadUrl) => {
  if (account.username) {
    const url = await getProfileUrlFromZoneFile(account.username);
    if (url) return { profileUrl: url, fromZoneFile: true };
  }

  const publicKey = getPublicKeyFromPrivate(account.dataPrivateKey);
  const address = publicKeyToAddress(publicKey);

  return { profileUrl: `${hubReadUrl}${address}/profile.json`, fromZoneFile: false };
};

const restoreProfile = async (account, walletHubConfig) => {
  // Just create a new account, no profile for sure
  if (!walletHubConfig) return null;

  // If already done in restoreUsernames, there will be attr:username in account.
  //   It can be null so need to use in.
  if (!('username' in account)) account.username = await getUsername(account);

  // If no username, default hubReadUrl to where found walletConfig
  const hubReadUrl = walletHubConfig.url_prefix;
  const { profileUrl, fromZoneFile } = await getProfileUrl(account, hubReadUrl);

  const res = await fetchPrivate(profileUrl);
  if (res.ok) {
    try {
      const json = await res.json();
      const { decodedToken } = json[0];
      return decodedToken.payload.claim;
    } catch (error) {
      return null;
    }
  } else if ([403, 404].includes(res.status)) {
    if (fromZoneFile) throw new Error('Not found profile specified in the zone file');
    return null;
  }

  throw new Error('Network error when restoring profile');
};

const doUseBefore = (walletConfig, appDomain, accountIndex = null) => {
  if (!walletConfig) return false;

  try {
    if (accountIndex) {
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

const chooseAccount = async (walletData, appData, accountIndex) => {
  // If create a new account, walletConfig and walletHubConfig are null.
  // If restore account,
  //   if found in one of three hubs, walletConfig and walletHubConfig are not null.
  //   if not found, walletConfig is null and walletHubConfig points to SD_HUB_URL.
  let { wallet, walletConfig, walletHubConfig } = walletData;
  const { domainName, appName, appIconUrl, appScopes } = appData;

  const account = wallet.accounts[accountIndex];
  const profile = await restoreProfile(account, walletHubConfig);

  // Update walletConfig only if
  //   1. Create a new account
  //   2. Not found in 3 hubs and no profile
  //   3. Found in one of 3 hubs and do not use before
  if (
    (!walletConfig && !walletHubConfig) ||
    (!walletConfig && !profile) ||
    (walletConfig && !doUseBefore(walletConfig, domainName, accountIndex))
  ) {
    if (!walletConfig) walletConfig = makeWalletConfig(wallet);
    if (!walletHubConfig) {
      walletHubConfig = await getHubConfig(wallet.configPrivateKey, SD_HUB_URL);
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
      walletConfig,
    });
  }

  let gaiaUrl = walletHubConfig.server;
  if (profile && profile.api && profile.api.gaiaHubUrl) {
    gaiaUrl = profile.api.gaiaHubUrl;
  }

  const publicKey = SECP256K1Client.derivePublicKey(account.dataPrivateKey);
  const address = publicKeyToAddress(publicKey);
  const did = makeDIDFromAddress(address);

  const appPrivateKey = getAppPrivateKey({ account, appDomain: domainName });

  const compressedAppPublicKey = getPublicKeyFromPrivate(appPrivateKey.slice(0, 64));
  const associationToken = makeGaiaAssociationToken({
    privateKey: account.dataPrivateKey,
    childPublicKeyHex: compressedAppPublicKey,
  });

  const userData = {
    username: account.username || '',
    email: null,
    profile: { ...(profile || DEFAULT_PROFILE), stxAddress: {} },
    decentralizedID: did,
    identityAddress: address,
    appPrivateKey: appPrivateKey,
    coreSessionToken: null,
    authResponseToken: null,
    hubUrl: gaiaUrl,
    coreNode: null,
    gaiaAssociationToken: associationToken,
  };

  return userData;
};

const wallet = { createAccount, restoreAccount, chooseAccount };

export default wallet;
