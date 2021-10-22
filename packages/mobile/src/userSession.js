// @ts-ignore
import RNBlockstackSdk from 'react-native-blockstack';

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

};

const loadUserData = async () => {
  return await RNBlockstackSdk.loadUserData();
};

const putFile = async (path, content, options = { encrypt: true }) => {
  const { fileUrl } = await RNBlockstackSdk.putFile(path, content, options);
  return fileUrl;
};

const getFile = async (path, options = { decrypt: true }) => {
  const result = await RNBlockstackSdk.getFile(path, options);
  if ('fileContentsEncoded' in result) return result.fileContentsEncoded;
  return result.fileContents;
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

export default {
  didSessionCreate, hasSession, createSession,
  isUserSignedIn, handlePendingSignIn, signUserOut,
  updateUserData, loadUserData, putFile, getFile, deleteFile, listFiles,
};
