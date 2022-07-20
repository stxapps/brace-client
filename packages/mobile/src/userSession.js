// @ts-ignore
import RNBlockstackSdk from 'react-native-blockstack';

import { DOT_JSON } from './types/const';

/* Need this sync function to check if session is available in ReduxOffline peek  */
let _didSessionCreate = false;
const didSessionCreate = () => {
  return _didSessionCreate;
};

const hasSession = async () => {
  const { hasSession: hs } = await RNBlockstackSdk.hasSession();
  _didSessionCreate = hs;
  return hs;
};

const createSession = async (config) => {
  const { loaded } = await RNBlockstackSdk.createSession(config);
  _didSessionCreate = true;
  return loaded;
};

const isUserSignedIn = async () => {
  const { signedIn } = await RNBlockstackSdk.isUserSignedIn();
  return signedIn;
};

const handlePendingSignIn = async (authResponse) => {
  const { loaded } = await RNBlockstackSdk.handlePendingSignIn(authResponse);
  return loaded;
};

const signUserOut = async () => {
  const { signedOut } = await RNBlockstackSdk.signUserOut();
  return signedOut;
};

const updateUserData = async (userData) => {
  const { updated } = await RNBlockstackSdk.updateUserData(userData);
  return updated;
};

const loadUserData = async () => {
  const userData = await RNBlockstackSdk.loadUserData();
  if (!userData.appPrivateKey) userData.appPrivateKey = userData.private_key;
  return userData;
};

const putFile = async (path, content, options = { encrypt: true }) => {
  if (path.endsWith(DOT_JSON)) content = JSON.stringify(content);
  const { fileUrl } = await RNBlockstackSdk.putFile(path, content, options);
  return fileUrl;
};

const getFile = async (path, options = { decrypt: true }) => {
  const result = await RNBlockstackSdk.getFile(path, options);

  let content;
  if ('fileContentsEncoded' in result) content = result.fileContentsEncoded;
  else content = result.fileContents;

  if (path.endsWith(DOT_JSON)) content = JSON.parse(content);
  return content;
};

const deleteFile = async (path, options = { wasSigned: false }) => {
  const { deleted } = await RNBlockstackSdk.deleteFile(path, options);
  return deleted;
};

const listFiles = async (callback) => {
  const { files, fileCount } = await RNBlockstackSdk.listFiles();
  files.forEach(file => callback(file));
  return fileCount;
};

const signECDSA = async (content) => {
  const userData = await loadUserData();
  const sigObj = await RNBlockstackSdk.signECDSA(userData.appPrivateKey, content);
  return sigObj;
};

const userSession = {
  didSessionCreate, hasSession, createSession,
  isUserSignedIn, handlePendingSignIn, signUserOut,
  updateUserData, loadUserData, putFile, getFile, deleteFile,
  listFiles, signECDSA,
};

export default userSession;
