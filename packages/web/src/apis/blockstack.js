import userSession from '../userSession';
import {
  GET_FILE, PUT_FILE, DELETE_FILE,
  SETTINGS_FNAME,
  N_LINKS, MAX_TRY,
} from '../types/const';
import {
  FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, DELETE_LINKS,
} from '../types/actionTypes';
import { DefaultDict } from '../utils';

export const effect = async (effectObj, _action) => {

  const { method, params } = effectObj;

  if (method === GET_FILE) {
    return userSession.getFile(params.fpath);
  }

  if (method === PUT_FILE) {
    return userSession.putFile(params.fpath, JSON.stringify(params.content));
  }

  if (method === DELETE_FILE) {
    return userSession.deleteFile(params.fpath);
  }

  if (method === FETCH) {
    return fetch(params);
  }

  if (method === FETCH_MORE) {
    return fetchMore(params);
  }

  if (method === ADD_LINKS || method === UPDATE_LINKS) {
    return putLinks(params);
  }

  if (method === DELETE_LINKS) {
    return deleteLinks(params);
  }

  throw new Error(`${method} is invalid for blockstack effect.`);
};

const createLinkFPath = (listName, id = null) => {
  listName = encodeURIComponent(listName);
  return id === null ? `links/${listName}` : `links/${listName}/${id}.json`;
};

const extractLinkFPath = (fpath) => {
  let [_, listName, fname] = fpath.split('/');
  listName = decodeURIComponent(listName);

  const dotIndex = fname.lastIndexOf('.');
  const ext = fname.substring(dotIndex + 1);
  fname = fname.substring(0, dotIndex);

  return { listName, fname, ext };
};

const listFPaths = async () => {
  // List fpaths(keys)
  // Even though aws, az, gc sorts a-z but on Gaia local machine, it's arbitrary
  //   so need to fetch all and sort locally.
  let linkFPaths = new DefaultDict(function () { return []; });
  let settingsFPath;

  await userSession.listFiles((fpath) => {
    if (fpath.startsWith('links')) {
      const { listName } = extractLinkFPath(fpath);
      linkFPaths[listName].push(fpath);
    } else if (fpath === SETTINGS_FNAME) {
      settingsFPath = fpath;
    } else {
      throw new Error(`Invalid file path: ${fpath}`);
    }

    return true;
  });

  return { linkFPaths, settingsFPath };
};

const batchGetFileWithRetry = async (fpaths, callCount) => {
  if (callCount >= MAX_TRY) {
    throw new Error('Number of retries exceeds MAX_TRY');
  }

  const responses = await Promise.all(
    fpaths.map(fpath =>
      userSession.getFile(fpath)
        .then(content => ({ content, fpath, success: true }))
        .catch(error => ({ error, fpath, success: false }))
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);

  if (failedResponses.length) {
    return [
      ...responses.filter(({ success }) => success),
      ...(await batchGetFileWithRetry(failedFPaths, callCount + 1))
    ];
  }

  return responses;
};

const fetch = async (listName) => {

  const { linkFPaths, settingsFPath } = await listFPaths();

  const selectedLinkFPaths = linkFPaths[listName].sort().reverse().slice(0, N_LINKS);
  const responses = await batchGetFileWithRetry(selectedLinkFPaths, 0);
  const links = responses.map(response => JSON.parse(response.content));
  const hasMore = linkFPaths[listName].length > N_LINKS;

  const listNames = Object.keys(linkFPaths);

  // If there is settings, fetch settings
  let settings;
  if (settingsFPath) {
    settings = JSON.parse(await userSession.getFile(settingsFPath));
  }

  return { listName, links, hasMore, listNames, settings };
};

const fetchMore = async (params) => {

  const { listName, ids } = params;

  const { linkFPaths } = await listFPaths();

  const filteredLinkFPaths = linkFPaths[listName].filter(fpath => {
    return !ids.includes(extractLinkFPath(fpath).fname);
  });

  const selectedLinkFPaths = filteredLinkFPaths.sort().reverse().slice(0, N_LINKS);
  const responses = await batchGetFileWithRetry(selectedLinkFPaths, 0);
  const links = responses.map(response => JSON.parse(response.content));
  const hasMore = filteredLinkFPaths.length > N_LINKS;

  return { listName, links, hasMore };
};

const batchPutFileWithRetry = async (fpaths, contents, callCount) => {
  if (callCount >= MAX_TRY) {
    throw new Error('Number of retries exceeds MAX_TRY');
  }

  const responses = await Promise.all(
    fpaths.map((fpath, i) =>
      userSession.putFile(fpath, JSON.stringify(contents[i]))
        .then(publicUrl => ({ publicUrl, fpath, success: true }))
        .catch(error => ({ error, fpath, success: false }))
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);

  if (failedResponses.length) {
    return [
      ...responses.filter(({ success }) => success),
      ...(await batchGetFileWithRetry(failedFPaths, callCount + 1))
    ];
  }

  return responses;
};

const putLinks = async (params) => {

  const { listName, links } = params;
  const linkFPaths = links.map(link => createLinkFPath(listName, link.id));
  const responses = await batchPutFileWithRetry(linkFPaths, links, 0);
  const publicUrls = responses.map(response => response.publicUrl);

  return { listName, links, publicUrls };
};

const batchDeleteFileWithRetry = async (fpaths, callCount) => {
  if (callCount >= MAX_TRY) {
    throw new Error('Number of retries exceeds MAX_TRY');
  }

  const responses = await Promise.all(
    fpaths.map((fpath) =>
      userSession.deleteFile(fpath)
        .then(() => ({ fpath, success: true }))
        .catch(error => ({ error, fpath, success: false }))
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);

  if (failedResponses.length) {
    return [
      ...responses.filter(({ success }) => success),
      ...(await batchGetFileWithRetry(failedFPaths, callCount + 1))
    ];
  }

  return responses;
};

const deleteLinks = async (params) => {

  const { listName, ids } = params;
  const linkFPaths = ids.map(id => createLinkFPath(listName, id));
  await batchDeleteFileWithRetry(linkFPaths, 0);

  return { listName, ids };
};
