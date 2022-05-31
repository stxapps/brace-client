import { SECP256K1Client } from 'jsontokens';
import { makeDIDFromAddress } from '@stacks/auth'
import {
  generateSecretKey, generateWallet, getRootNode, deriveLegacyConfigPrivateKey,
  fetchWalletConfig, fetchUsernameForAccountByDerivationType, DerivationType,
  deriveStxPrivateKey, deriveAccount, makeWalletConfig, updateWalletConfigWithApp,
  getAppPrivateKey,
} from '@stacks/wallet-sdk';
import {
  DEFAULT_PROFILE, fetchAccountProfileUrl, fetchProfileFromUrl,
} from '@stacks/wallet-sdk/dist/models/profile';
import {
  fetchLegacyWalletConfig,
} from '@stacks/wallet-sdk/dist/models/legacy-wallet-config';
import {
  getHubInfo, connectToGaiaHubWithConfig, makeGaiaAssociationToken,
} from '@stacks/wallet-sdk/dist/utils';
import { getPublicKeyFromPrivate, publicKeyToAddress } from '@stacks/encryption';
import { StacksMainnet } from '@stacks/network';

const DEFAULT_PASSWORD = 'password';
const DEFAULT_GAIA_HUB_URL = 'https://hub.blockstack.org';
const DEFAULT_GAIA_HUB_READ_URL = 'https://gaia.blockstack.org/hub/';

const N_ACCOUNTS = 10;

const network = new StacksMainnet();

const createAccount = async () => {
  const secretKey = generateSecretKey(256);
  const wallet = await generateWallet({ secretKey, password: DEFAULT_PASSWORD });
  return { secretKey, wallet };
};

const restoreConfigs = async (wallet, gaiaHubUrl) => {
  const hubInfo = await getHubInfo(gaiaHubUrl, network.fetchFn);
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
    fetchWalletConfig({
      wallet, gaiaHubConfig: currentGaiaConfig, fetchFn: network.fetchFn,
    }),
    fetchLegacyWalletConfig({
      wallet, gaiaHubConfig: legacyGaiaConfig, fetchFn: network.fetchFn,
    }),
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
    const newAccounts = await Promise.all(
      walletConfig.accounts.map(async (_, index) => {
        let existingAccount = wallet.accounts[index];
        const { username } = await fetchUsernameForAccountByDerivationType({
          rootNode,
          index,
          derivationType: DerivationType.Wallet,
          network,
        });
        if (!existingAccount) {
          existingAccount = deriveAccount({
            rootNode,
            index,
            salt: wallet.salt,
            stxDerivationType: DerivationType.Wallet,
          });
        } else {
          existingAccount = {
            ...existingAccount,
            stxPrivateKey: deriveStxPrivateKey({
              rootNode,
              index,
            }),
          };
        }
        return { ...existingAccount, username: username };
      })
    );

    wallet = { ...wallet, accounts: newAccounts };
    return { wallet, walletConfig, walletGaiaConfig: currentGaiaConfig };
  }

  if (legacyWalletConfig) {
    const newAccounts = await Promise.all(
      legacyWalletConfig.identities.map(async (_, index) => {
        let existingAccount = wallet.accounts[index];
        const { username } = await fetchUsernameForAccountByDerivationType({
          rootNode,
          index,
          derivationType: DerivationType.Wallet,
          network,
        });
        if (!existingAccount) {
          existingAccount = deriveAccount({
            rootNode,
            index,
            salt: wallet.salt,
            stxDerivationType: DerivationType.Wallet,
          });
        } else {
          existingAccount = {
            ...existingAccount,
            stxPrivateKey: deriveStxPrivateKey({
              rootNode,
              index,
            }),
          };
        }
        return { ...existingAccount, username };
      })
    );

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

const restoreProfiles = async (wallet, gaiaHubReadUrl) => {
  for (let i = 0, j = wallet.accounts.length; i < j; i += N_ACCOUNTS) {
    const _accounts = wallet.accounts.slice(i, i + N_ACCOUNTS);
    await Promise.all(_accounts.map(async (account) => {
      const profileUrl = await fetchAccountProfileUrl(
        { account, gaiaHubUrl: gaiaHubReadUrl }
      );
      const profile = await fetchProfileFromUrl(profileUrl, network.fetchFn);
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
  } catch (e) {
    return { errMsg: 'Your Secret Key is invaid. Please check and try again.' };
  }

  const walletData = await restoreConfigs(wallet, DEFAULT_GAIA_HUB_URL);
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
  } catch (e) { console.log('doUseBefore error: ', e); }

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
