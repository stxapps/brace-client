import { UserSession, AppConfig } from '@stacks/auth/dist/esm'
import { signECDSA as _signECDSA } from '@stacks/encryption/dist/esm';

import { DOMAIN_NAME, APP_SCOPES } from './types/const';

const _appConfig = new AppConfig(APP_SCOPES, DOMAIN_NAME);
const _userSession = new UserSession({ appConfig: _appConfig });

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
  const sessionData = _userSession.store.getSessionData();
  sessionData.userData = userData;
  _userSession.store.setSessionData(sessionData);
};

const loadUserData = () => {
  return _userSession.loadUserData();
};

const signECDSA = (content) => {
  const userData = loadUserData();
  const sigObj = _signECDSA(userData.appPrivateKey, content);
  return sigObj;
};

const userSession = {
  _userSession, isUserSignedIn, isSignInPending, handlePendingSignIn, signUserOut,
  updateUserData, loadUserData, signECDSA,
};

export default userSession;
