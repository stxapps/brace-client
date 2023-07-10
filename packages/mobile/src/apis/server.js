// @ts-expect-error
import RNBlockstackSdk from 'react-native-blockstack';
import { Dirs } from 'react-native-file-access';

import { DOT_JSON, N_LINKS } from '../types/const';
import {
  isObject, copyFPaths, addFPath, deleteFPath, batchGetFileWithRetry,
  batchPutFileWithRetry, batchDeleteFileWithRetry,
} from '../utils';
import { cachedServerFPaths } from '../vars';

const getFileOptions = { decrypt: true, dir: Dirs.DocumentDir };
const getFile = async (fpath, options = getFileOptions) => {
  const result = await RNBlockstackSdk.getFile(fpath, options);

  let content;
  if ('fileContentsEncoded' in result) content = result.fileContentsEncoded;
  else content = result.fileContents;

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

const putFileOptions = { encrypt: true, dir: Dirs.DocumentDir };
const putFile = async (fpath, content, options = putFileOptions) => {
  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);
  const { fileUrl } = await RNBlockstackSdk.putFile(fpath, content, options);

  if (isObject(cachedServerFPaths.fpaths)) {
    const fpaths = copyFPaths(cachedServerFPaths.fpaths);
    addFPath(fpaths, fpath);
    cachedServerFPaths.fpaths = fpaths;
  }

  return fileUrl;
};

const putFiles = async (fpaths, contents) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
    const _fpaths = fpaths.slice(i, i + N_LINKS);
    const _contents = contents.slice(i, i + N_LINKS);
    await batchPutFileWithRetry(putFile, _fpaths, _contents, 0);
  }
};

const deleteFile = async (fpath, options = { wasSigned: false }) => {
  const { deleted } = await RNBlockstackSdk.deleteFile(fpath, options);

  if (isObject(cachedServerFPaths.fpaths)) {
    const fpaths = copyFPaths(cachedServerFPaths.fpaths);
    deleteFPath(fpaths, fpath);
    cachedServerFPaths.fpaths = fpaths;
  }

  return deleted;
};

const deleteFiles = async (fpaths) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
    const _fpaths = fpaths.slice(i, i + N_LINKS);
    await batchDeleteFileWithRetry(deleteFile, _fpaths, 0);
  }
};

const listFiles = async (callback) => {
  const { files, fileCount } = await RNBlockstackSdk.listFiles();
  for (const fpath of files) {
    // A bug in Gaia hub, fpath for revocation is also included!
    if (fpath === 'auth/authTimestamp') continue;
    callback(fpath);
  }
  return fileCount;
};

const server = {
  cachedFPaths: cachedServerFPaths, getFile, getFiles, putFile, putFiles, deleteFile,
  deleteFiles, listFiles,
};

export default server;
