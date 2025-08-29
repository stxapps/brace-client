import serverApi from './server';
import cacheApi from './localCache';
import {
  LINKS, SSLTS, SETTINGS, INFO, PINS, TAGS, N_LINKS, PUT_FILE, DELETE_FILE,
} from '../types/const';
import {
  isObject, addFPath, batchGetFileWithRetry, getPerformFilesDataPerId,
} from '../utils';

const _listFPaths = async (listFiles) => {
  // List fpaths(keys)
  // Even though aws, az, gc sorts a-z but on Gaia local machine, it's arbitrary
  //   so need to fetch all and sort locally.
  const fpaths = {
    linkFPaths: {}, ssltFPaths: [], staticFPaths: [], settingsFPaths: [],
    infoFPath: null, pinFPaths: [], tagFPaths: [],
  };
  await listFiles((fpath) => {
    addFPath(fpaths, fpath);
    return true;
  });
  return fpaths;
};

const listFPaths = async (doForce = false) => {
  if (isObject(serverApi.cachedFPaths.fpaths) && !doForce) {
    return serverApi.cachedFPaths.fpaths;
  }
  serverApi.cachedFPaths.fpaths = await _listFPaths(serverApi.listFiles);
  return serverApi.cachedFPaths.fpaths;
};

const getFiles = async (fpaths, dangerouslyIgnoreError = false) => {
  const result = { responses: [], fpaths: [], contents: [] };

  const remainFPaths = [];
  for (const fpath of fpaths) {
    let content;
    if ([LINKS, SSLTS, SETTINGS, INFO, PINS, TAGS].some(el => fpath.startsWith(el))) {
      content = await cacheApi.getFile(fpath, true);
    }
    if (content === undefined) {
      remainFPaths.push(fpath);
      continue;
    }

    result.responses.push({ content, fpath, success: true });
    result.fpaths.push(fpath);
    result.contents.push(content);
  }

  for (let i = 0; i < remainFPaths.length; i += N_LINKS) {
    const selectedFPaths = remainFPaths.slice(i, i + N_LINKS);
    const responses = await batchGetFileWithRetry(
      serverApi.getFile, selectedFPaths, 0, dangerouslyIgnoreError
    );
    for (const response of responses) {
      result.responses.push(response);
      result.fpaths.push(response.fpath);
      result.contents.push(response.content);

      if (response.success) {
        const { fpath, content } = response;
        if (
          [LINKS, SSLTS, SETTINGS, INFO, PINS, TAGS].some(el => fpath.startsWith(el))
        ) {
          await cacheApi.putFile(fpath, content);
        }
      }
    }
  }

  return result;
};

const performFiles = async (data) => {
  const results = await serverApi.performFiles(data);

  const dataPerId = getPerformFilesDataPerId(data);
  for (const result of results) {
    if (!result.success) continue;

    const { type, path: fpath, content } = dataPerId[result.id];
    if (
      [LINKS, SSLTS, SETTINGS, INFO, PINS, TAGS].some(el => fpath.startsWith(el))
    ) {
      if (type === PUT_FILE) {
        await cacheApi.putFile(fpath, content);
      } else if (type === DELETE_FILE) {
        await cacheApi.deleteFile(fpath);
      } else {
        console.log('In dataApi.performFiles, invalid data:', data);
      }
    }
  }

  return results;
};

const data = { listFPaths, getFiles, performFiles };

export default data;
