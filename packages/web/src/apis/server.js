import { Storage } from '@stacks/storage/dist/esm';

import userSession from '../userSession';
import { DOT_JSON, N_LINKS } from '../types/const';
import {
  isObject, copyFPaths, addFPath, deleteFPath, batchGetFileWithRetry,
  batchPutFileWithRetry, batchDeleteFileWithRetry, sleep, randomString, sample,
} from '../utils';
import { cachedServerFPaths } from '../vars';

const _userSession = userSession._userSession;

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

const getFile = async (fpath, options = {}) => {
  const rId = `${Date.now()}${randomString(4)}`;
  await respectLimit(rId, 1);

  const storage = new Storage({ userSession: _userSession });
  let content = /** @type {any} */(await storage.getFile(fpath, options));
  if (fpath.endsWith(DOT_JSON)) content = JSON.parse(content);

  updateNetworkInfos(rId, 1);
  return content;
};

const getFiles = async (fpaths, dangerouslyIgnoreError = false) => {
  // No order guarantee btw fpaths and responses
  const result = { responses: [], fpaths: [], contents: [] };

  for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
    const selectedFPaths = fpaths.slice(i, i + N_LINKS);
    const responses = await batchGetFileWithRetry(
      getFile, selectedFPaths, 0, dangerouslyIgnoreError
    );
    for (const response of responses) {
      result.responses.push(response);
      result.fpaths.push(response.fpath);
      result.contents.push(response.content);
    }
  }

  return result;
};

const putFileOptions = { dangerouslyIgnoreEtag: true };
const putFile = async (fpath, content, options = putFileOptions) => {
  const rId = `${Date.now()}${randomString(4)}`;
  await respectLimit(rId, 2); // POST and DELETE require OPTION.

  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

  const storage = new Storage({ userSession: _userSession });
  const publicUrl = await storage.putFile(fpath, content, options);

  if (isObject(cachedServerFPaths.fpaths)) {
    const fpaths = copyFPaths(cachedServerFPaths.fpaths);
    addFPath(fpaths, fpath);
    cachedServerFPaths.fpaths = fpaths;
  }

  updateNetworkInfos(rId, 2);
  return publicUrl;
};

const putFiles = async (fpaths, contents, dangerouslyIgnoreError = false) => {
  // No order guarantee btw fpaths and responses
  const result = { responses: [] };

  for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
    const selectedFPaths = fpaths.slice(i, i + N_LINKS);
    const selectedContents = contents.slice(i, i + N_LINKS);
    const responses = await batchPutFileWithRetry(
      putFile, selectedFPaths, selectedContents, 0, dangerouslyIgnoreError
    );
    for (const response of responses) {
      result.responses.push(response);
    }
  }

  return result;
};

const deleteFile = async (fpath, options = {}) => {
  const rId = `${Date.now()}${randomString(4)}`;
  await respectLimit(rId, 2);

  const storage = new Storage({ userSession: _userSession });
  const result = storage.deleteFile(fpath, options);

  if (isObject(cachedServerFPaths.fpaths)) {
    const fpaths = copyFPaths(cachedServerFPaths.fpaths);
    deleteFPath(fpaths, fpath);
    cachedServerFPaths.fpaths = fpaths;
  }

  updateNetworkInfos(rId, 2);
  return result;
};

const deleteFiles = async (fpaths, dangerouslyIgnoreError = false) => {
  // No order guarantee btw fpaths and responses
  const result = { responses: [] };

  for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
    const selectedFPaths = fpaths.slice(i, i + N_LINKS);
    const responses = await batchDeleteFileWithRetry(
      deleteFile, selectedFPaths, 0, dangerouslyIgnoreError
    );
    for (const response of responses) {
      result.responses.push(response);
    }
  }

  return result;
};

const listFiles = async (callback) => {
  const rId = `${Date.now()}${randomString(4)}`;
  await respectLimit(rId, 2);

  const storage = new Storage({ userSession: _userSession });
  const result = await storage.listFiles((fpath) => {
    // A bug in Gaia hub, fpath for revocation is also included!
    if (fpath === 'auth/authTimestamp') return true;
    return callback(fpath);
  });

  // Bug alert: 100 is a number of fpaths per request and can be changed.
  updateNetworkInfos(rId, Math.ceil(result / 100) + 1);
  return result;
};

const server = {
  cachedFPaths: cachedServerFPaths, getFile, getFiles, putFile, putFiles, deleteFile,
  deleteFiles, listFiles,
};

export default server;
