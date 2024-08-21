// @ts-expect-error
import RNBlockstackSdk from 'react-native-blockstack';

import userSession from '../userSession';

const signECDSA = async (content) => {
  const userData = await userSession.loadUserData();
  const sigObj = await RNBlockstackSdk.signECDSA(userData.appPrivateKey, content);
  return sigObj;
};

const encrypt = async (content) => {
  return content;
};

const decrypt = async (encryptedContent) => {
  return encryptedContent;
};

const encryption = { signECDSA, encrypt, decrypt };

export default encryption;
