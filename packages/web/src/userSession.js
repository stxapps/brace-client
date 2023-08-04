import { UserSession, AppConfig } from '@stacks/auth/dist/esm';
import { SessionData } from '@stacks/auth/dist/esm/sessionData';
import {
  signECDSA as _signECDSA, encryptContent, decryptContent,
} from '@stacks/encryption/dist/esm';

import { DOMAIN_NAME, APP_SCOPES } from './types/const';

const _appConfig = new AppConfig(APP_SCOPES, DOMAIN_NAME);
const _userSession = new UserSession({ appConfig: _appConfig });

const didSessionCreate = () => {
  return true;
};

const isUserSignedIn = () => {
  return _userSession.isUserSignedIn();
};

const isSignInPending = () => {
  return _userSession.isSignInPending();
};

const handlePendingSignIn = () => {
  return _userSession.handlePendingSignIn();
};

const signUserOut = () => {
  _userSession.signUserOut();
};

const updateUserData = (userData) => {
  let sessionData;
  try {
    sessionData = _userSession.store.getSessionData();
  } catch (error) {
    console.log('Create a new SessionData as getSessionData error:', error);
    sessionData = new SessionData({});
  }
  sessionData.userData = userData;
  _userSession.store.setSessionData(sessionData);
};

const loadUserData = () => {
  return _userSession.loadUserData();
};

const signECDSA = async (content) => {
  const userData = loadUserData();
  const sigObj = _signECDSA(userData.appPrivateKey, content);
  return sigObj;
};

const encrypt = (content) => {
  const userData = loadUserData();
  const options = { privateKey: userData.appPrivateKey };
  return encryptContent(content, options);
};

const decrypt = (encryptedContent) => {
  const userData = loadUserData();
  const options = { privateKey: userData.appPrivateKey };
  return decryptContent(encryptedContent, options);
};

const userSession = {
  _userSession, didSessionCreate, isUserSignedIn, isSignInPending, handlePendingSignIn,
  signUserOut, updateUserData, loadUserData, signECDSA, encrypt, decrypt,
};

export default userSession;
