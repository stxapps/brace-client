import { SECP256K1Client, TokenSigner } from 'jsontokens';
import { parseZoneFile } from 'zone-file';
import { makeDIDFromAddress } from '@stacks/auth/dist/esm'
import {
  generateSecretKey, generateWallet, getRootNode, deriveAccount, makeWalletConfig,
  updateWalletConfigWithApp, getAppPrivateKey, getStxAddress,
} from '@stacks/wallet-sdk/dist/esm';
import { DEFAULT_PROFILE } from '@stacks/wallet-sdk/dist/esm/models/profile';
import { getHubInfo, makeGaiaAssociationToken } from '@stacks/wallet-sdk/dist/esm/utils';
import { TransactionVersion } from '@stacks/transactions/dist/esm';
import {
  randomBytes, hexStringToECPair, ecPairToAddress, encryptContent, decryptContent,
  getPublicKeyFromPrivate, publicKeyToAddress,
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

  return { secretKey, wallet, fromCreateAccount: true };
};

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

const _getWalletConfig = async (wallet, hubUrl) => {
  // if server down, throw error.
  const hubInfo = await getHubInfo(hubUrl);
  const walletHubConfig = getHubConfig(hubUrl, hubInfo, wallet.configPrivateKey, null);

  // If server down, throw error. If 404, 403, not found, return null. Else throw error.
  const { url_prefix, address } = walletHubConfig;
  const url = `${url_prefix}${address}/wallet-config.json`;
  const res = await fetchPrivate(url);
  if (res.ok) {
    const encrypted = await res.text();
    const configJson = /** @type {string} */(await decryptContent(
      encrypted, { privateKey: wallet.configPrivateKey }
    ));
    try {
      const walletConfig = JSON.parse(configJson);
      return { walletConfig, walletHubConfig, hubInfo };
    } catch (error) {
      // treat it like no walletConfig i.e. invalid format
      return { walletConfig: null, walletHubConfig, hubInfo };
    }
  }
  if ([403, 404].includes(res.status)) {
    return { walletConfig: null, walletHubConfig, hubInfo };
  }

  throw new Error('Network error when fetching walletConfig');
};

const getWalletConfig = async (wallet) => {
  const wcResult = {};

  const sdResult = await _getWalletConfig(wallet, SD_HUB_URL);
  wcResult.sdHubInfo = sdResult.hubInfo;
  if (sdResult.walletConfig) {
    wcResult.walletConfig = sdResult.walletConfig;
    wcResult.walletHubConfig = sdResult.walletHubConfig;
    return wcResult;
  }

  const hrResult = await _getWalletConfig(wallet, HR_HUB_URL);
  wcResult.hrHubInfo = hrResult.hubInfo;
  if (hrResult.walletConfig) {
    wcResult.walletConfig = hrResult.walletConfig;
    wcResult.walletHubConfig = hrResult.walletHubConfig;
    return wcResult;
  }

  const bsResult = await _getWalletConfig(wallet, BS_HUB_URL);
  wcResult.bsHubInfo = bsResult.hubInfo;
  if (bsResult.walletConfig) {
    wcResult.walletConfig = bsResult.walletConfig;
    wcResult.walletHubConfig = bsResult.walletHubConfig;
    return wcResult;
  }

  // if not found, walletHubConfig points to SD_HUB_URL for default in profile lookup.
  wcResult.walletConfig = null;
  wcResult.walletHubConfig = sdResult.walletHubConfig;
  return wcResult;
};

const restoreWalletConfig = async (wallet) => {
  const rootNode = getRootNode(wallet);
  const salt = wallet.salt;

  const wcResult = await getWalletConfig(wallet);
  if (wcResult.walletConfig && Array.isArray(wcResult.walletConfig.accounts)) {
    const newAccounts = wcResult.walletConfig.accounts.map((account, index) => {
      let existingAccount = wallet.accounts[index];
      if (!existingAccount) {
        existingAccount = deriveAccount({ rootNode, index, salt });
      }
      return { ...existingAccount };
    });

    wallet = { ...wallet, accounts: newAccounts };
  }

  return { ...wcResult, wallet };
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
    if (json.names.length > 0) return json.names[0];
    return null;
  }

  throw new Error('Network error when restoring username');
};

const restoreUsernames = async (accounts) => {
  for (let i = 0, j = accounts.length; i < j; i += N_ACCOUNTS) {
    const _accounts = accounts.slice(i, i + N_ACCOUNTS);
    await Promise.all(_accounts.map(async (account) => {
      account.username = await getUsername(account);
    }));
  }
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

const restoreProfile = async (account, fromCreateAccount, walletHubConfig) => {
  // Just create a new account, no profile for sure
  if (fromCreateAccount || !walletHubConfig) return null;

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
      account.profile = decodedToken.payload.claim;
    } catch (error) {
      // treat it like no profile i.e. invalid format, missing values
    }
    return;
  } else if ([403, 404].includes(res.status)) {
    if (fromZoneFile) throw new Error('Not found profile specified in the zone file');
    return;
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

const updateWalletConfig = async (walletData, appData, account, accountIndex) => {
  const { wallet, fromCreateAccount } = walletData;
  const { domainName, appName, appIconUrl, appScopes } = appData;

  let { walletConfig, walletHubConfig, sdHubInfo } = walletData;

  // Update walletConfig only if
  //   1. Create a new account
  //   2. Not found in 3 hubs and no profile
  //   3. Found in one of 3 hubs and do not use before
  if (
    fromCreateAccount ||
    (!walletConfig && !account.profile) ||
    (walletConfig && !doUseBefore(walletConfig, domainName, accountIndex))
  ) {
    if (!walletConfig) {
      walletConfig = makeWalletConfig(wallet);
      walletData.walletConfig = walletConfig;
    }
    if (!walletHubConfig) {
      if (!sdHubInfo) {
        sdHubInfo = await getHubInfo(SD_HUB_URL);
        walletData.sdHubInfo = sdHubInfo;
      }
      walletHubConfig = getHubConfig(
        SD_HUB_URL, sdHubInfo, wallet.configPrivateKey, null
      );
      walletData.walletHubConfig = walletHubConfig;
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
};

const isUsingHub = async (hubConfig) => {
  const url = `${hubConfig.server}/list-files/${hubConfig.address}`;
  const res = await fetchPrivate(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${hubConfig.token}`,
    },
    body: JSON.stringify({ page: null, pageSize: 1, stat: false }),
  });
  if (res.ok) {
    const json = await res.json();
    if (json.entries.length > 0) return true;
    return false;
  }

  throw new Error('Network error when calling isUsingHub');
};

const storeInfoFile = async (hubConfig, privateKey) => {
  const publicKey = getPublicKeyFromPrivate(privateKey);
  const encryptedContent = await encryptContent(JSON.stringify({}), { publicKey });

  const addedDT = Date.now();
  const url = `${hubConfig.server}/store/${hubConfig.address}/info${addedDT}.json`;
  const res = await fetchPrivate(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${hubConfig.token}`,
    },
    body: encryptedContent,
  });
  if (res.ok) {
    const json = await res.json();
    return json;
  }

  throw new Error('Network error when storing info file');
};

const revokeAuth = async (hubConfig) => {
  // revoke on the old hubs, not the currently using one,
  //   so timestamp here should be fine.
  const oldestValidTimestamp = Math.trunc(Date.now() / 1000);

  const url = `${hubConfig.server}/revoke-all/${hubConfig.address}`;
  const res = await fetchPrivate(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${hubConfig.token}`,
    },
    body: JSON.stringify({ oldestValidTimestamp }),
  });
  if (res.ok) {
    const json = await res.json();
    return json;
  }

  // Can't throw error as already stored infoFile so need to let it go.
  return null;
};

const getUsingHubUrl = async (walletData, profile, appPrivateKey, associationToken) => {
  if (profile && profile.api && profile.api.gaiaHubUrl) {
    return profile.api.gaiaHubUrl;
  }

  let { sdHubInfo, hrHubInfo, bsHubInfo } = walletData;

  if (!sdHubInfo) {
    sdHubInfo = await getHubInfo(SD_HUB_URL);
    walletData.sdHubInfo = sdHubInfo;
  }
  const sdAppHubConfig = getHubConfig(
    SD_HUB_URL, sdHubInfo, appPrivateKey, associationToken
  );

  if (walletData.fromCreateAccount) {
    await storeInfoFile(sdAppHubConfig, appPrivateKey);
    return SD_HUB_URL;
  }

  let isUsing = await isUsingHub(sdAppHubConfig);
  if (isUsing) return SD_HUB_URL;

  if (!hrHubInfo) {
    hrHubInfo = await getHubInfo(HR_HUB_URL);
    walletData.hrHubInfo = hrHubInfo;
  }
  const hrAppHubConfig = getHubConfig(
    HR_HUB_URL, hrHubInfo, appPrivateKey, associationToken
  );
  isUsing = await isUsingHub(hrAppHubConfig);
  if (isUsing) return HR_HUB_URL;

  if (!bsHubInfo) {
    bsHubInfo = await getHubInfo(BS_HUB_URL);
    walletData.bsHubInfo = bsHubInfo;
  }
  const bsAppHubConfig = getHubConfig(
    BS_HUB_URL, bsHubInfo, appPrivateKey, associationToken
  );
  isUsing = await isUsingHub(bsAppHubConfig);
  if (isUsing) return BS_HUB_URL;

  await storeInfoFile(sdAppHubConfig, appPrivateKey);
  await Promise.all([revokeAuth(hrAppHubConfig), revokeAuth(bsAppHubConfig)])

  return SD_HUB_URL;
};

const chooseAccount = async (walletData, appData, accountIndex) => {
  // If create a new account, walletConfig and walletHubConfig are null.
  // If restore account,
  //   if found in one of three hubs, walletConfig and walletHubConfig are not null.
  //   if not found, walletConfig is null and walletHubConfig points to SD_HUB_URL.
  const { wallet, fromCreateAccount, walletHubConfig } = walletData;

  const account = wallet.accounts[accountIndex];
  await restoreProfile(account, fromCreateAccount, walletHubConfig);

  const publicKey = SECP256K1Client.derivePublicKey(account.dataPrivateKey);
  const address = publicKeyToAddress(publicKey);
  const did = makeDIDFromAddress(address);

  const appPrivateKey = getAppPrivateKey({ account, appDomain: appData.domainName });

  const compressedAppPublicKey = getPublicKeyFromPrivate(appPrivateKey.slice(0, 64));
  const associationToken = makeGaiaAssociationToken({
    privateKey: account.dataPrivateKey,
    childPublicKeyHex: compressedAppPublicKey,
  });

  await updateWalletConfig(walletData, appData, account, accountIndex);

  const hubUrl = await getUsingHubUrl(
    walletData, account.profile, appPrivateKey, associationToken,
  );

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
