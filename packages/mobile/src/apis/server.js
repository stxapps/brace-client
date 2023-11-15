// @ts-expect-error
import RNBlockstackSdk from 'react-native-blockstack';
import { Dirs } from 'react-native-file-access';

import { DOT_JSON, N_LINKS } from '../types/const';
import {
  isObject, copyFPaths, addFPath, deleteFPath, batchGetFileWithRetry,
  batchPutFileWithRetry, batchDeleteFileWithRetry, sleep, randomString, sample,
} from '../utils';
import { cachedServerFPaths } from '../vars';

let networkInfos = []; // info = { rId, dt, nRequests }

const respectLimit = async (rId, nRequests) => {
  const LIMIT = 72; // Requests per minute
  const ONE_MINUTE = 60 * 1000;
  const N_TRIES = 4;

  let result = false;
  for (let currentTry = 1; currentTry <= N_TRIES; currentTry++) {
    networkInfos = networkInfos.filter(info => info.dt >= Date.now() - ONE_MINUTE);

    let tReqs = 0, tDT = Date.now(), doExceed = false;
    for (let i = networkInfos.length - 1; i >= 0; i--) {
      const info = networkInfos[i];
      if (info.nRequests + tReqs >= LIMIT) {
        doExceed = true;
        break;
      }

      tReqs += info.nRequests;
      tDT = info.dt;
    }
    if (!doExceed) {
      updateNetworkInfos(rId, nRequests);
      result = true;
      break;
    }
    if (currentTry < N_TRIES) {
      const frac = sample([1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]);
      let duration = ONE_MINUTE - (Date.now() - tDT) + frac;
      if (duration < 0) duration = 0;
      if (duration > ONE_MINUTE + frac) duration = ONE_MINUTE + frac;
      await sleep(duration);
    }
  }
  return result;
};

const updateNetworkInfos = (rId, nRequests) => {
  for (const info of networkInfos) {
    if (info.rId === rId) {
      [info.dt, info.nRequests] = [Date.now(), nRequests];
      return;
    }
  }

  networkInfos.push({ rId, dt: Date.now(), nRequests });
};

const getFileOptions = { decrypt: true, dir: Dirs.DocumentDir };
const getFile = async (fpath, options = getFileOptions) => {
  const rId = `${Date.now()}${randomString(4)}`;
  await respectLimit(rId, 1);

  const result = await RNBlockstackSdk.getFile(fpath, options);

  let content;
  if ('fileContentsEncoded' in result) content = result.fileContentsEncoded;
  else content = result.fileContents;

  if (fpath.endsWith(DOT_JSON)) content = JSON.parse(content);

  updateNetworkInfos(rId, 1);
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
  const rId = `${Date.now()}${randomString(4)}`;
  await respectLimit(rId, 1);

  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);
  const { fileUrl } = await RNBlockstackSdk.putFile(fpath, content, options);

  if (isObject(cachedServerFPaths.fpaths)) {
    const fpaths = copyFPaths(cachedServerFPaths.fpaths);
    addFPath(fpaths, fpath);
    cachedServerFPaths.fpaths = fpaths;
  }

  updateNetworkInfos(rId, 1);
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
  const rId = `${Date.now()}${randomString(4)}`;
  await respectLimit(rId, 1);

  const { deleted } = await RNBlockstackSdk.deleteFile(fpath, options);

  if (isObject(cachedServerFPaths.fpaths)) {
    const fpaths = copyFPaths(cachedServerFPaths.fpaths);
    deleteFPath(fpaths, fpath);
    cachedServerFPaths.fpaths = fpaths;
  }

  updateNetworkInfos(rId, 1);
  return deleted;
};

const deleteFiles = async (fpaths) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
    const _fpaths = fpaths.slice(i, i + N_LINKS);
    await batchDeleteFileWithRetry(deleteFile, _fpaths, 0);
  }
};

const listFiles = async (callback) => {
  const rId = `${Date.now()}${randomString(4)}`;
  await respectLimit(rId, 1);

  const { files, fileCount } = await RNBlockstackSdk.listFiles();
  for (const fpath of files) {
    // A bug in Gaia hub, fpath for revocation is also included!
    if (fpath === 'auth/authTimestamp') continue;
    callback(fpath);
  }

  // Bug alert: 100 is a number of fpaths per request and can be changed.
  updateNetworkInfos(rId, Math.ceil(fileCount / 100));
  return fileCount;
};

const server = {
  cachedFPaths: cachedServerFPaths, getFile, getFiles, putFile, putFiles, deleteFile,
  deleteFiles, listFiles,
};

export default server;
