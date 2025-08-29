import { SECP256K1Client } from 'jsontokens';
import { parseZoneFile } from 'zone-file';
import { makeDIDFromAddress } from '@stacks/auth/dist/esm';
import {
  generateSecretKey, generateWallet, getAppPrivateKey, getStxAddress,
  makeGaiaAssociationToken, DEFAULT_PROFILE,
} from '@stacks/wallet-sdk/dist/esm';
import { getTokenFileUrl } from '@stacks/profile/dist/esm';
import { TransactionVersion } from '@stacks/transactions/dist/esm';
import {
  getPublicKeyFromPrivate, publicKeyToBtcAddress,
} from '@stacks/encryption/dist/esm';
import { createFetchFn } from '@stacks/network/dist/esm';

import { HR_HUB_URL, SD_HUB_URL } from '../types/const';
import { isObject, isString, sleep } from '../utils';

const fetchFn = createFetchFn();

const DEFAULT_PASSWORD = 'password';

export const createAccount = async (appData) => {
  const secretKey = generateSecretKey(256);
  const wallet = await generateWallet({ secretKey, password: DEFAULT_PASSWORD });

  const walletData = { appData, secretKey, wallet, fromCreateAccount: true };
  return walletData;
};

export const restoreAccount = async (appData, secretKey) => {
  if (!isString(secretKey)) return { errMsg: 'Please fill in your Secret Key.' };

  let wallet;
  try {
    wallet = await generateWallet({ secretKey, password: DEFAULT_PASSWORD });
  } catch (error) {
    console.log('Error when restore account: ', error);
    return { errMsg: 'Your Secret Key is invaid. Please check and try again.' };
  }

  const walletData = { appData, wallet };
  return walletData;
};

const getUsername = async (account) => {
  const stxAddress = getStxAddress({
    account, transactionVersion: TransactionVersion.Mainnet,
  });

  // if server down, treat it as no username for now.
  const url = `https://api.hiro.so/v1/addresses/stacks/${stxAddress}`;
  try {
    let res = await fetchFn(url);
    if (!res.ok) {
      await sleep(4000); // Wait for a while and try one more time
      res = await fetchFn(url);
    }
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.names) && json.names.length > 0) return json.names[0];
    }
  } catch (error) {
    console.log('getUsername error:', error);
  }

  return null;
};

const getProfileUrlFromZoneFile = async (name) => {
  // if server down, treat it as no profile for now.
  const url = `https://api.hiro.so/v1/names/${name}`;
  try {
    const res = await fetchFn(url);
    if (res.ok) {
      const nameInfo = await res.json();
      const zone = parseZoneFile(nameInfo.zonefile);
      const target = getTokenFileUrl(zone);
      if (isString(target) && target.length > 0) return target;
    }
  } catch (error) {
    console.log('getProfileUrlFromZoneFile error:', error);
  }

  return null;
};

const restoreProfile = async (walletData, accountIndex) => {
  const { wallet } = walletData;
  const account = wallet.accounts[accountIndex];

  // If already done in restoreUsernames, there will be attr:username in account.
  //   It can be null so need to use in.
  if (!('username' in account)) account.username = await getUsername(account);

  let url;
  if (isString(account.username) && account.username.length > 0) {
    url = await getProfileUrlFromZoneFile(account.username);
    if (isString(url)) {
      try {
        const res = await fetchFn(url);
        if (res.ok) {
          const json = await res.json();
          const { decodedToken } = json[0];
          account.profile = decodedToken.payload.claim;
          return;
        }
      } catch (error) {
        // All errors, try below for now.
      }
    }
  }
};

export const chooseAccount = async (walletData, accountIndex) => {
  const { appData, wallet, fromCreateAccount } = walletData;

  if (!fromCreateAccount) await restoreProfile(walletData, accountIndex);

  const account = wallet.accounts[accountIndex];

  const publicKey = SECP256K1Client.derivePublicKey(account.dataPrivateKey);
  const address = publicKeyToBtcAddress(publicKey);
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
  if (hubUrl === HR_HUB_URL) hubUrl = SD_HUB_URL;

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
