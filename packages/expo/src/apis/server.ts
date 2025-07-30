import RNBlockstackSdk from 'react-native-blockstack';
import { Dirs } from 'react-native-file-access';

import { DOT_JSON, PUT_FILE, DELETE_FILE, N_LINKS, SD_HUB_URL } from '../types/const';
import {
  isObject, isString, isNumber, copyFPaths, addFPath, deleteFPath, randomString,
  getPerformFilesDataPerId,
} from '../utils';
import { getLimiter } from '../utils/limit';
import vars, { cachedServerFPaths } from '../vars';

let limiter, strgLimiter;
const respectLimit = async (rId, nRequests, isStrg = false) => {
  let sltdLimiter;
  if (isStrg) {
    if (!strgLimiter) strgLimiter = getLimiter(288);
    sltdLimiter = strgLimiter;
  } else {
    if (!limiter) limiter = getLimiter(vars.user.hubUrl === SD_HUB_URL ? 144 : 72);
    sltdLimiter = limiter;
  }

  await sltdLimiter.respectLimit(rId, nRequests);
};
const updateNetworkInfos = (rId, nRequests, isStrg = false) => {
  let sltdLimiter;
  if (isStrg) {
    if (!strgLimiter) strgLimiter = getLimiter(288);
    sltdLimiter = strgLimiter;
  } else {
    if (!limiter) limiter = getLimiter(vars.user.hubUrl === SD_HUB_URL ? 144 : 72);
    sltdLimiter = limiter;
  }

  sltdLimiter.updateNetworkInfos(rId, nRequests);
};

const getFileOptions = { decrypt: true, dir: Dirs.DocumentDir };
const getFile = async (fpath, options = getFileOptions) => {
  const rId = `${Date.now()}${randomString(4)}`;
  if (vars.user.hubUrl === SD_HUB_URL) await respectLimit(rId, 1, true);
  else await respectLimit(rId, 1);

  const result = await RNBlockstackSdk.getFile(fpath, options);

  let content;
  if ('fileContentsEncoded' in result) content = result.fileContentsEncoded;
  else content = result.fileContents;

  if (fpath.endsWith(DOT_JSON)) content = JSON.parse(content);

  if (vars.user.hubUrl === SD_HUB_URL) updateNetworkInfos(rId, 1, true);
  else updateNetworkInfos(rId, 1);

  return content;
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

const stringifyData = async (data) => {
  const sfyData = { ...data };
  if (Array.isArray(data.values) && [true, false].includes(data.isSequential)) {
    sfyData.values = [];
    for (const value of data.values) {
      const sfyValue = await stringifyData(value);
      sfyData.values.push(sfyValue);
    }
  } else if (isString(data.id) && isString(data.type) && isString(data.path)) {
    if (data.type === PUT_FILE && data.path.endsWith(DOT_JSON)) {
      sfyData.content = JSON.stringify(data.content);
    }
  } else {
    console.log('In stringifyData, invalid data:', data);
  }
  return sfyData;
};

const cacheDataToServerFPaths = async (data, results) => {
  if (!isObject(cachedServerFPaths.fpaths)) return;

  const fpaths = copyFPaths(cachedServerFPaths.fpaths);
  const dataPerId = getPerformFilesDataPerId(data);

  for (const result of results) {
    if (!result.success) continue;

    const { type, path: fpath } = dataPerId[result.id];
    if (type === PUT_FILE) addFPath(fpaths, fpath);
    else if (type === DELETE_FILE) deleteFPath(fpaths, fpath);
    else console.log('In cacheData, invalid data:', data);
  }

  cachedServerFPaths.fpaths = fpaths;
};

const _performFiles = async (data) => {
  if (Array.isArray(data.values) && data.values.length === 0) return [];

  const rId = `${Date.now()}${randomString(4)}`;
  await respectLimit(rId, 1);

  const sfyData = await stringifyData(data);
  const sfySfyData = JSON.stringify(sfyData);
  const unResults = await RNBlockstackSdk.performFiles(sfySfyData, Dirs.DocumentDir);
  const results = JSON.parse(unResults);
  await cacheDataToServerFPaths(data, results);

  updateNetworkInfos(rId, 1);
  return results;
};

const nsPerformFile = async (data) => {
  const { id, type, path: fpath } = data;

  if (type === PUT_FILE) {
    const publicUrl = await putFile(fpath, data.content);
    return { success: true, id, publicUrl };
  }

  if (type === DELETE_FILE) {
    try {
      await deleteFile(fpath);
    } catch (error) {
      // BUG ALERT
      // Treat not found error as not an error as local data might be out-dated.
      //   i.e. user tries to delete a not-existing file, it's ok.
      // Anyway, if the file should be there, this will hide the real error!
      const isDoesNotExistError = (
        isObject(error) &&
        isString(error.message) &&
        (
          (
            error.message.includes('failed to delete') &&
            error.message.includes('404')
          ) ||
          (
            error.message.includes('deleteFile Error') &&
            error.message.includes('GaiaError error 5')
          ) ||
          error.message.includes('does_not_exist') ||
          error.message.includes('file_not_found')
        )
      );
      if (!isDoesNotExistError) throw error;
    }
    return { success: true, id };
  }

  throw new Error(`Invalid data.type: ${data.type}`);
};

const nsPerformFiles = async (data) => {
  const results = [];

  if (Array.isArray(data.values) && [true, false].includes(data.isSequential)) {
    if (data.isSequential) {
      for (const value of data.values) {
        const pResults = await nsPerformFiles(value);
        results.push(...pResults);
        if (pResults.some(result => !result.success)) break;
      }
    } else {
      let nItems = 1;
      if (isNumber(data.nItemsForNs)) nItems = Math.min(data.nItemsForNs, N_LINKS);

      for (let i = 0; i < data.values.length; i += nItems) {
        const selectedValues = data.values.slice(i, i + nItems);
        const aResults = await Promise.all(selectedValues.map(value => {
          return nsPerformFiles(value);
        }));
        for (const pResults of aResults) {
          results.push(...pResults);
        }
      }
    }
  } else if (isString(data.id) && isString(data.type) && isString(data.path)) {
    try {
      const result = await nsPerformFile(data);
      results.push(result);
    } catch (error) {
      results.push({
        error: error.toString().slice(0, 999), success: false, id: data.id,
      });
    }
  } else {
    console.log('In nsPerformFiles, invalid data:', data);
  }

  return results;
};

const performFiles = async (data) => {
  let results;
  if (vars.user.hubUrl === SD_HUB_URL) {
    results = await _performFiles(data);
  } else {
    results = await nsPerformFiles(data);
  }
  return results;
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

  // Bug alert: 100, 2400 are a number of fpaths per request and can be changed.
  const pageSize = vars.user.hubUrl === SD_HUB_URL ? 2400 : 100;
  updateNetworkInfos(rId, Math.ceil(fileCount / pageSize));
  return fileCount;
};

const server = { cachedFPaths: cachedServerFPaths, getFile, performFiles, listFiles };

export default server;
