import { Storage } from '@stacks/storage/dist/esm';

import userSession from '../userSession';
import { DOT_JSON, N_LINKS } from '../types/const';
import {
  isObject, copyFPaths, addFPath, deleteFPath, batchGetFileWithRetry,
  batchPutFileWithRetry, batchDeleteFileWithRetry,
} from '../utils';
import { cachedServerFPaths } from '../vars';

const _userSession = userSession._userSession;

const getFile = async (fpath, options = {}) => {
  const storage = new Storage({ userSession: _userSession });
  let content = /** @type {any} */(await storage.getFile(fpath, options));
  if (fpath.endsWith(DOT_JSON)) content = JSON.parse(content);
  return content;
};

const getFiles = async (_fpaths, dangerouslyIgnoreError = false) => {

  const fpaths = [], contents = []; // No order guarantee btw _fpaths and responses
  for (let i = 0, j = _fpaths.length; i < j; i += N_LINKS) {
    const selectedFPaths = _fpaths.slice(i, i + N_LINKS);
    const responses = await batchGetFileWithRetry(
      getFile, selectedFPaths, 0, dangerouslyIgnoreError
    );
    fpaths.push(...responses.map(({ fpath }) => fpath));
    contents.push(...responses.map(({ content }) => content));
  }

  return { fpaths, contents };
};

const putFileOptions = { dangerouslyIgnoreEtag: true };
const putFile = async (fpath, content, options = putFileOptions) => {
  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

  const storage = new Storage({ userSession: _userSession });
  const publicUrl = await storage.putFile(fpath, content, options);

  if (isObject(cachedServerFPaths.fpaths)) {
    const fpaths = copyFPaths(cachedServerFPaths.fpaths);
    addFPath(fpaths, fpath);
    cachedServerFPaths.fpaths = fpaths;
  }

  return publicUrl;
};

const putFiles = async (fpaths, contents) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
    const _fpaths = fpaths.slice(i, i + N_LINKS);
    const _contents = contents.slice(i, i + N_LINKS);
    await batchPutFileWithRetry(putFile, _fpaths, _contents, 0);
  }
};

const deleteFile = async (fpath, options = {}) => {
  const storage = new Storage({ userSession: _userSession });
  const result = storage.deleteFile(fpath, options);

  if (isObject(cachedServerFPaths.fpaths)) {
    const fpaths = copyFPaths(cachedServerFPaths.fpaths);
    deleteFPath(fpaths, fpath);
    cachedServerFPaths.fpaths = fpaths;
  }

  return result;
};

const deleteFiles = async (fpaths) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
    const _fpaths = fpaths.slice(i, i + N_LINKS);
    await batchDeleteFileWithRetry(deleteFile, _fpaths, 0);
  }
};

const listFiles = (callback) => {
  const storage = new Storage({ userSession: _userSession });
  return storage.listFiles((fpath) => {
    // A bug in Gaia hub, fpath for revocation is also included!
    if (fpath === 'auth/authTimestamp') return true;
    return callback(fpath);
  });
};

const server = {
  cachedFPaths: cachedServerFPaths, getFile, getFiles, putFile, putFiles, deleteFile,
  deleteFiles, listFiles,
};

export default server;
