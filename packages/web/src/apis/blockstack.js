import userSession from '../userSession';
import { SETTINGS_FNAME, N_LINKS, MAX_TRY, N_DAYS, TRASH } from '../types/const';
import {
  FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, DELETE_LINKS, DELETE_OLD_LINKS_IN_TRASH,
  UPDATE_SETTINGS, PIN_LINK, UNPIN_LINK,
} from '../types/actionTypes';
import {
  createLinkFPath, extractLinkFPath, createPinFPath, copyFPaths, getMainId,
  sortWithPins,
} from '../utils';
import { cachedFPaths } from '../vars';

export const effect = async (effectObj, _action) => {

  const { method, params } = effectObj;

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

  if (method === DELETE_OLD_LINKS_IN_TRASH) {
    return deleteOldLinksInTrash();
  }

  if (method === UPDATE_SETTINGS) {
    return updateSettings(params);
  }

  if (method === PIN_LINK) {
    return pinLink(params);
  }

  if (method === UNPIN_LINK) {
    return unpinLink(params);
  }

  throw new Error(`${method} is invalid for blockstack effect.`);
};

const addFPath = (fpaths, fpath) => {
  if (fpath.startsWith('links')) {
    const { listName } = extractLinkFPath(fpath);
    if (!fpaths.linkFPaths[listName]) fpaths.linkFPaths[listName] = [];
    if (!fpaths.linkFPaths[listName].includes(fpath)) {
      fpaths.linkFPaths[listName].push(fpath);
    }
  } else if (fpath === SETTINGS_FNAME) {
    fpaths.settingsFPath = fpath;
  } else if (fpath.startsWith('pins')) {
    if (!fpaths.pinFPaths.includes(fpath)) fpaths.pinFPaths.push(fpath);
  } else {
    console.log(`Invalid file path: ${fpath}`);
  }
};

const deleteFPath = (fpaths, fpath) => {
  if (fpath.startsWith('links')) {
    const { listName } = extractLinkFPath(fpath);
    if (fpaths.linkFPaths[listName]) {
      fpaths.linkFPaths[listName] = fpaths.linkFPaths[listName].filter(el => {
        return el !== fpath;
      });
      if (fpaths.linkFPaths[listName].length === 0) delete fpaths.linkFPaths[listName];
    }
  } else if (fpath === SETTINGS_FNAME) {
    fpaths.settingsFPath = null;
  } else if (fpath.startsWith('pins')) {
    fpaths.pinFPaths = fpaths.pinFPaths.filter(el => el !== fpath);
  } else {
    console.log(`Invalid file path: ${fpath}`);
  }
};

const _listFPaths = async () => {
  // List fpaths(keys)
  // Even though aws, az, gc sorts a-z but on Gaia local machine, it's arbitrary
  //   so need to fetch all and sort locally.
  const fpaths = { linkFPaths: {}, settingsFPath: null, pinFPaths: [] };
  await userSession.listFiles((fpath) => {
    addFPath(fpaths, fpath);
    return true;
  });
  return fpaths;
};

const listFPaths = async (doForce = false) => {
  if (cachedFPaths.fpaths && !doForce) return copyFPaths(cachedFPaths.fpaths);
  cachedFPaths.fpaths = await _listFPaths();
  return copyFPaths(cachedFPaths.fpaths);
};

export const batchGetFileWithRetry = async (
  fpaths, callCount, dangerouslyIgnoreError = false
) => {

  const responses = await Promise.all(
    fpaths.map(fpath =>
      userSession.getFile(fpath)
        .then(content => ({ content, fpath, success: true }))
        .catch(error => ({ content: null, fpath, success: false, error }))
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);

  if (failedResponses.length) {
    if (callCount + 1 >= MAX_TRY) {
      if (dangerouslyIgnoreError) {
        console.log('batchGetFileWithRetry error: ', failedResponses[0].error);
        return responses;
      }
      throw failedResponses[0].error;
    }

    return [
      ...responses.filter(({ success }) => success),
      ...(await batchGetFileWithRetry(
        failedFPaths, callCount + 1, dangerouslyIgnoreError
      )),
    ];
  }

  return responses;
};

const fetch = async (params) => {

  let { listName, doDescendingOrder, doFetchSettings, pendingPins } = params;
  const { linkFPaths, settingsFPath, pinFPaths } = await listFPaths(doFetchSettings);

  let settings;
  if (settingsFPath && doFetchSettings) {
    settings = JSON.parse(/** @type {string} */(await userSession.getFile(settingsFPath)));

    doDescendingOrder = settings.doDescendingOrder;
  }

  const namedLinkFPaths = linkFPaths[listName] || [];
  let sortedLinkFPaths = namedLinkFPaths.sort();
  if (doDescendingOrder) sortedLinkFPaths.reverse();

  sortedLinkFPaths = sortWithPins(sortedLinkFPaths, pinFPaths, pendingPins, (fpath) => {
    const { id } = extractLinkFPath(fpath);
    return getMainId(id);
  });
  const selectedLinkFPaths = sortedLinkFPaths.slice(0, N_LINKS);

  const responses = await batchGetFileWithRetry(selectedLinkFPaths, 0, true);
  const links = responses.filter(r => r.success).map(r => JSON.parse(r.content));
  const hasMore = namedLinkFPaths.length > N_LINKS;

  // List names should be retrieve from settings
  //   but also retrive from file paths in case the settings is gone.
  const listNames = Object.keys(linkFPaths);

  return {
    listName, doDescendingOrder, links, hasMore, listNames, doFetchSettings, settings,
  };
};

const fetchMore = async (params) => {

  const { listName, ids, doDescendingOrder, pendingPins } = params;
  const { linkFPaths, pinFPaths } = await listFPaths();

  const namedLinkFPaths = linkFPaths[listName] || [];
  let sortedLinkFPaths = namedLinkFPaths.sort();
  if (doDescendingOrder) sortedLinkFPaths.reverse();

  sortedLinkFPaths = sortWithPins(sortedLinkFPaths, pinFPaths, pendingPins, (fpath) => {
    const { id } = extractLinkFPath(fpath);
    return getMainId(id);
  });

  // With pins, can't fetch further from the current point
  const filteredLinkFPaths = sortedLinkFPaths.filter(fpath => {
    const { id } = extractLinkFPath(fpath);
    return !ids.includes(id);
  });
  const selectedLinkFPaths = filteredLinkFPaths.slice(0, N_LINKS);

  const responses = await batchGetFileWithRetry(selectedLinkFPaths, 0, true);
  const links = responses.filter(r => r.success).map(r => JSON.parse(r.content));
  const hasMore = filteredLinkFPaths.length > N_LINKS;

  return { listName, doDescendingOrder, links, hasMore };
};

export const batchPutFileWithRetry = async (fpaths, contents, callCount) => {

  const responses = await Promise.all(
    fpaths.map((fpath, i) =>
      userSession.putFile(fpath, contents[i], { dangerouslyIgnoreEtag: true })
        .then(publicUrl => {
          addFPath(cachedFPaths.fpaths, fpath);
          cachedFPaths.fpaths = copyFPaths(cachedFPaths.fpaths);
          return { publicUrl, fpath, success: true };
        })
        .catch(error => ({ error, fpath, content: contents[i], success: false }))
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);
  const failedContents = failedResponses.map(({ content }) => content);

  if (failedResponses.length) {
    if (callCount + 1 >= MAX_TRY) throw failedResponses[0].error;

    return [
      ...responses.filter(({ success }) => success),
      ...(await batchPutFileWithRetry(failedFPaths, failedContents, callCount + 1)),
    ];
  }

  return responses;
};

const putLinks = async (params) => {
  const { listName, links } = params;

  const fpaths = [], contents = [];
  for (const link of links) {
    fpaths.push(createLinkFPath(listName, link.id));
    contents.push(JSON.stringify(link));
  }

  await batchPutFileWithRetry(fpaths, contents, 0);
  return { listName, links };
};

export const batchDeleteFileWithRetry = async (fpaths, callCount) => {

  const responses = await Promise.all(
    fpaths.map((fpath) =>
      userSession.deleteFile(fpath)
        .then(() => {
          deleteFPath(cachedFPaths.fpaths, fpath);
          cachedFPaths.fpaths = copyFPaths(cachedFPaths.fpaths);
          return { fpath, success: true };
        })
        .catch(error => {
          // BUG ALERT
          // Treat not found error as not an error as local data might be out-dated.
          //   i.e. user tries to delete a not-existing file, it's ok.
          // Anyway, if the file should be there, this will hide the real error!
          if (error.message &&
            (error.message.includes('does_not_exist') ||
              error.message.includes('file_not_found'))) {
            return { fpath, success: true };
          }
          return { error, fpath, success: false };
        })
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);

  if (failedResponses.length) {
    if (callCount + 1 >= MAX_TRY) throw failedResponses[0].error;

    return [
      ...responses.filter(({ success }) => success),
      ...(await batchDeleteFileWithRetry(failedFPaths, callCount + 1)),
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

const deleteOldLinksInTrash = async () => {

  const { linkFPaths } = await listFPaths();

  const trashLinkFPaths = linkFPaths[TRASH] || [];
  let oldFPaths = trashLinkFPaths.filter(fpath => {
    const { id } = extractLinkFPath(fpath);
    const removedDT = id.split('-')[3];
    const interval = Date.now() - Number(removedDT);
    const days = interval / 1000 / 60 / 60 / 24;

    return days > N_DAYS;
  });

  oldFPaths = oldFPaths.slice(0, N_LINKS);
  const ids = oldFPaths.map(fpath => {
    const { id } = extractLinkFPath(fpath);
    return id;
  });

  await batchDeleteFileWithRetry(oldFPaths, 0);

  return { listName: TRASH, ids };
};

const updateSettings = async (settings) => {
  const fpaths = [SETTINGS_FNAME];
  const contents = [JSON.stringify(settings)];

  await batchPutFileWithRetry(fpaths, contents, 0);
};

export const canDeleteListNames = async (listNames) => {

  const { linkFPaths } = await listFPaths();
  const inUseListNames = Object.keys(linkFPaths);

  const canDeletes = [];
  for (const listName of listNames) {
    canDeletes.push(!inUseListNames.includes(listName));
  }

  return canDeletes;
};

const pinLink = async (params) => {
  const { pins } = params;

  const fpaths = [], contents = [];
  for (const pin of pins) {
    fpaths.push(createPinFPath(pin.rank, pin.addedDT, pin.id));
    contents.push(JSON.stringify({}));
  }

  await batchPutFileWithRetry(fpaths, contents, 0);
  return { pins };
};

const unpinLink = async (params) => {

  const { pins } = params;
  const pinFPaths = pins.map(pin => createPinFPath(pin.rank, pin.addedDT, pin.id));
  await batchDeleteFileWithRetry(pinFPaths, 0);

  return { pins };
};
