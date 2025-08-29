import {
  signECDSA as _signECDSA, encryptContent, decryptContent,
} from '@stacks/encryption/dist/esm';

import userSession from '../userSession';

const signECDSA = async (content) => {
  const userData = userSession.loadUserData();
  const sigObj = _signECDSA(userData.appPrivateKey, content);
  return sigObj;
};

const encrypt = (content) => {
  const userData = userSession.loadUserData();
  const options = { privateKey: userData.appPrivateKey };
  return encryptContent(content, options);
};

const decrypt = (encryptedContent) => {
  const userData = userSession.loadUserData();
  const options = { privateKey: userData.appPrivateKey };
  return decryptContent(encryptedContent, options);
};

const encryption = { signECDSA, encrypt, decrypt };

export default encryption;
