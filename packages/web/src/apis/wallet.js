import { SECP256K1Client } from 'jsontokens';
import { makeDIDFromAddress } from '@stacks/auth/dist/esm'
import {
  generateSecretKey, generateWallet, getRootNode, deriveLegacyConfigPrivateKey,
  fetchWalletConfig, deriveAccount, makeWalletConfig, updateWalletConfigWithApp,
  getAppPrivateKey, getStxAddress,
} from '@stacks/wallet-sdk/dist/esm';
import {
  DEFAULT_PROFILE, fetchAccountProfile,
} from '@stacks/wallet-sdk/dist/esm/models/profile';
import {
  fetchLegacyWalletConfig,
} from '@stacks/wallet-sdk/dist/esm/models/legacy-wallet-config';
import {
  getHubInfo, connectToGaiaHubWithConfig, makeGaiaAssociationToken,
} from '@stacks/wallet-sdk/dist/esm/utils';
import { TransactionVersion } from '@stacks/transactions/dist/esm';
import {
  getPublicKeyFromPrivate, publicKeyToAddress,
} from '@stacks/encryption/dist/esm';
import { fetchPrivate } from '@stacks/common/dist/esm';

const DEFAULT_PASSWORD = 'password';
const DEFAULT_GAIA_HUB_URL = 'https://hub.blockstack.org';
const DEFAULT_GAIA_HUB_READ_URL = 'https://gaia.blockstack.org/hub/';

const N_ACCOUNTS = 10;

const createAccount = async () => {
  const secretKey = generateSecretKey(256);
  const wallet = await generateWallet({ secretKey, password: DEFAULT_PASSWORD });
  return { secretKey, wallet };
};

const restoreConfigs = async (wallet, gaiaHubUrl) => {
  const hubInfo = await getHubInfo(gaiaHubUrl);
  const rootNode = getRootNode(wallet);
  const legacyGaiaConfig = connectToGaiaHubWithConfig({
    hubInfo,
    privateKey: deriveLegacyConfigPrivateKey(rootNode),
    gaiaHubUrl,
  });
  const currentGaiaConfig = connectToGaiaHubWithConfig({
    hubInfo,
    privateKey: wallet.configPrivateKey,
    gaiaHubUrl,
  });

  const [walletConfig, legacyWalletConfig] = await Promise.all([
    fetchWalletConfig({ wallet, gaiaHubConfig: currentGaiaConfig }),
    fetchLegacyWalletConfig({ wallet, gaiaHubConfig: legacyGaiaConfig }),
  ]);

  let walletConfigAccountsLength = 0;
  if (walletConfig && walletConfig.accounts) {
    walletConfigAccountsLength = walletConfig.accounts.length;
  }
  let walletConfigIdentitiesLength = 0;
  if (legacyWalletConfig && legacyWalletConfig.identities) {
    walletConfigIdentitiesLength = legacyWalletConfig.identities.length;
  }
  if (walletConfig && walletConfigAccountsLength >= walletConfigIdentitiesLength) {
    const newAccounts = walletConfig.accounts.map((account, index) => {
      let existingAccount = wallet.accounts[index];
      if (!existingAccount) {
        existingAccount = deriveAccount({
          rootNode,
          index,
          salt: wallet.salt,
        });
      }
      return {
        ...existingAccount,
        username: account.username,
      };
    });

    wallet = { ...wallet, accounts: newAccounts };
    return { wallet, walletConfig, walletGaiaConfig: currentGaiaConfig };
  }

  if (legacyWalletConfig) {
    const newAccounts = legacyWalletConfig.identities.map((identity, index) => {
      let existingAccount = wallet.accounts[index];
      if (!existingAccount) {
        existingAccount = deriveAccount({
          rootNode,
          index,
          salt: wallet.salt,
        });
      }
      return {
        ...existingAccount,
        username: identity.username,
      };
    });

    wallet = { ...wallet, accounts: newAccounts };

    const meta = {};
    if (legacyWalletConfig.hideWarningForReusingIdentity) {
      meta.hideWarningForReusingIdentity = true;
    }
    const newConfig = {
      accounts: legacyWalletConfig.identities.map(identity => ({
        username: identity.username,
        apps: identity.apps,
      })),
      meta,
    };

    return {
      wallet,
      walletConfig: newConfig,
      walletGaiaConfig: currentGaiaConfig,
      doUpdate: true,
    };
  }

  return { wallet, walletGaiaConfig: currentGaiaConfig };
};

const restoreUsernames = async (wallet) => {
  for (let i = 0, j = wallet.accounts.length; i < j; i += N_ACCOUNTS) {
    const _accounts = wallet.accounts.slice(i, i + N_ACCOUNTS);
    await Promise.all(_accounts.map(async (account) => {
      if (account.username) return;

      const stxAddress = getStxAddress({
        account, transactionVersion: TransactionVersion.Mainnet,
      });
      const nameUrl = `https://api.hiro.so/v1/addresses/stacks/${stxAddress}`;
      const res = await fetchPrivate(nameUrl);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.names) && json.names.length > 0) {
          account.username = json.names[0];
        }
      }
    }));
  }

  return wallet;
};

const restoreProfiles = async (wallet, gaiaHubReadUrl) => {
  for (let i = 0, j = wallet.accounts.length; i < j; i += N_ACCOUNTS) {
    const _accounts = wallet.accounts.slice(i, i + N_ACCOUNTS);
    await Promise.all(_accounts.map(async (account) => {
      const profile = await fetchAccountProfile({ account, gaiaHubUrl: gaiaHubReadUrl });
      if (profile) account.profile = profile;
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

  const walletData = await restoreConfigs(wallet, DEFAULT_GAIA_HUB_URL);
  walletData.wallet = await restoreUsernames(walletData.wallet);
  walletData.wallet = await restoreProfiles(
    walletData.wallet, DEFAULT_GAIA_HUB_READ_URL
  );

  return walletData;
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
  } catch (error) { console.log('doUseBefore error: ', error); }

  return false;
};

const chooseAccount = async (walletData, appData, accountIndex) => {
  const { wallet } = walletData;
  const { domainName, appName, appIconUrl, appScopes } = appData;

  const account = wallet.accounts[accountIndex];

  if (
    !walletData.walletConfig ||
    !doUseBefore(walletData.walletConfig, domainName, accountIndex) ||
    walletData.doUpdate
  ) {
    let walletConfig = walletData.walletConfig;
    if (!walletConfig) walletConfig = makeWalletConfig(wallet);

    let walletGaiaConfig = walletData.walletGaiaConfig;
    if (!walletGaiaConfig) {
      const hubInfo = await getHubInfo(DEFAULT_GAIA_HUB_URL);
      walletGaiaConfig = connectToGaiaHubWithConfig({
        hubInfo,
        privateKey: wallet.configPrivateKey,
        gaiaHubUrl: DEFAULT_GAIA_HUB_URL,
      });
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
      gaiaHubConfig: walletGaiaConfig,
      walletConfig,
    });
  }

  const profile = account.profile;

  let gaiaUrl = DEFAULT_GAIA_HUB_URL;
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
