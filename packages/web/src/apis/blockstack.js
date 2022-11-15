import userSession from '../userSession';
import fileApi from './file';
import {
  SETTINGS, DOT_JSON, N_LINKS, MAX_TRY, N_DAYS, TRASH, CD_ROOT,
} from '../types/const';
import {
  FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, DELETE_LINKS, DELETE_OLD_LINKS_IN_TRASH,
  UPDATE_SETTINGS, PIN_LINK, UNPIN_LINK, UPDATE_CUSTOM_DATA,
} from '../types/actionTypes';
import {
  isObject, isString, createLinkFPath, extractLinkFPath, extractFPath, createPinFPath,
  addFPath, deleteFPath, copyFPaths, getMainId, sortWithPins, getStaticFPath,
  deriveFPaths,
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
    return putPins(params);
  }

  if (method === UNPIN_LINK) {
    return deletePins(params);
  }

  if (method === UPDATE_CUSTOM_DATA) {
    return updateCustomData(params);
  }

  throw new Error(`${method} is invalid for blockstack effect.`);
};

const _listFPaths = async () => {
  // List fpaths(keys)
  // Even though aws, az, gc sorts a-z but on Gaia local machine, it's arbitrary
  //   so need to fetch all and sort locally.
  const fpaths = {
    linkFPaths: {}, staticFPaths: [], settingsFPath: null, pinFPaths: [],
  };
  await userSession.listFiles((fpath) => {
    addFPath(fpaths, fpath);
    return true;
  });
  return fpaths;
};

const listFPaths = async (doForce = false) => {
  if (isObject(cachedFPaths.fpaths) && !doForce) return copyFPaths(cachedFPaths.fpaths);
  cachedFPaths.fpaths = await _listFPaths();
  return copyFPaths(cachedFPaths.fpaths);
};

const batchGetFileWithRetry = async (
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

const fetchStaticFiles = async (links) => {
  const fpaths = [];
  for (const link of links) {
    if (isObject(link.custom)) {
      const { image } = link.custom;
      if (isString(image) && image.startsWith(CD_ROOT + '/')) {
        fpaths.push(image);
      }
    }
  }

  const files = await fileApi.getFiles(fpaths); // Check if already exists locally

  const images = {}, remainedFPaths = [];
  for (let i = 0; i < files.fpaths.length; i++) {
    const fpath = files.fpaths[i], contentUrl = files.contentUrls[i];
    if (isString(contentUrl)) images[fpath] = contentUrl;
    else remainedFPaths.push(fpath);
  }

  const fpathMap = {}, remainedStaticFPaths = [];
  for (const fpath of remainedFPaths) {
    const staticFPath = getStaticFPath(fpath);
    fpathMap[staticFPath] = fpath;
    remainedStaticFPaths.push(staticFPath);
  }
  const _responses = await batchGetFileWithRetry(remainedStaticFPaths, 0, true);
  const responses = _responses.filter(r => r.success);

  const results = await fileApi.putFiles(
    responses.map(r => r.fpath).map(fpath => fpathMap[fpath]),
    responses.map(r => r.content)
  );

  for (let i = 0; i < results.fpaths.length; i++) {
    images[results.fpaths[i]] = results.contentUrls[i];
  }

  return { images };
};

const fetch = async (params) => {

  let { listName, doDescendingOrder, doFetchSettings, pendingPins } = params;
  const { linkFPaths, settingsFPath, pinFPaths } = await listFPaths(doFetchSettings);

  let settings;
  if (settingsFPath && doFetchSettings) {
    settings = await userSession.getFile(settingsFPath);
    doDescendingOrder = settings.doDescendingOrder;
  }

  const namedLinkFPaths = linkFPaths[listName] || [];
  let sortedLinkFPaths = [...namedLinkFPaths].sort();
  if (doDescendingOrder) sortedLinkFPaths.reverse();

  sortedLinkFPaths = sortWithPins(sortedLinkFPaths, pinFPaths, pendingPins, (fpath) => {
    const { id } = extractLinkFPath(fpath);
    return getMainId(id);
  });
  const selectedLinkFPaths = sortedLinkFPaths.slice(0, N_LINKS);

  const responses = await batchGetFileWithRetry(selectedLinkFPaths, 0, true);
  const links = responses.filter(r => r.success).map(r => r.content);
  const hasMore = namedLinkFPaths.length > N_LINKS;

  // List names should be retrieve from settings
  //   but also retrive from file paths in case the settings is gone.
  const listNames = Object.keys(linkFPaths);

  const { images } = await fetchStaticFiles(links);

  return {
    listName, doDescendingOrder, links, hasMore, listNames, doFetchSettings, settings,
    images,
  };
};

const fetchMore = async (params) => {

  const { listName, ids, doDescendingOrder, pendingPins } = params;
  const { linkFPaths, pinFPaths } = await listFPaths();

  const namedLinkFPaths = linkFPaths[listName] || [];
  let sortedLinkFPaths = [...namedLinkFPaths].sort();
  if (doDescendingOrder) sortedLinkFPaths.reverse();

  sortedLinkFPaths = sortWithPins(sortedLinkFPaths, pinFPaths, pendingPins, (fpath) => {
    const { id } = extractLinkFPath(fpath);
    return getMainId(id);
  });

  // With pins, can't fetch further from the current point
  let filteredLinkFPaths = [], hasDisorder = false;
  for (let i = 0; i < sortedLinkFPaths.length; i++) {
    const fpath = sortedLinkFPaths[i];
    const { id } = extractLinkFPath(fpath);
    if (!ids.includes(id)) {
      if (i < ids.length) hasDisorder = true;
      filteredLinkFPaths.push(fpath);
    }
  }
  const selectedLinkFPaths = filteredLinkFPaths.slice(0, N_LINKS);

  const responses = await batchGetFileWithRetry(selectedLinkFPaths, 0, true);
  const links = responses.filter(r => r.success).map(r => r.content);
  const hasMore = filteredLinkFPaths.length > N_LINKS;

  const { images } = await fetchStaticFiles(links);

  return { listName, doDescendingOrder, links, hasMore, hasDisorder, images };
};

const batchPutFileWithRetry = async (fpaths, contents, callCount) => {

  const responses = await Promise.all(
    fpaths.map((fpath, i) =>
      userSession.putFile(fpath, contents[i])
        .then(publicUrl => {
          if (!cachedFPaths.fpaths) {
            // Possible if in Adding.js and just sign in to add a link,
            //  so fetch is never called and also nothing to rehydrate in redux-offline.
            console.log('In batchPutFileWithRetry, cachedFPaths.fpaths is null.');
          } else {
            addFPath(cachedFPaths.fpaths, fpath);
            cachedFPaths.fpaths = copyFPaths(cachedFPaths.fpaths);
          }
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
    contents.push(link);
  }

  await batchPutFileWithRetry(fpaths, contents, 0);
  return { listName, links };
};

const batchDeleteFileWithRetry = async (fpaths, callCount) => {

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
          if (
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
          ) {
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

const deleteStaticFiles = async (ids) => {
  const mainIds = ids.map(id => getMainId(id));

  const staticFPaths = [];
  const { staticFPaths: _staticFPaths } = await listFPaths();
  for (const fpath of _staticFPaths) {
    const { id } = extractFPath(fpath);
    if (mainIds.includes(getMainId(id))) staticFPaths.push(fpath);
  }

  try {
    batchDeleteFileWithRetry(staticFPaths, 0);
    fileApi.deleteFiles(staticFPaths);
  } catch (error) {
    console.log('deleteStaticFiles error: ', error);
    // error in this step should be fine
  }
};

const deleteLinks = async (params) => {

  const { listName, ids } = params;
  const linkFPaths = ids.map(id => createLinkFPath(listName, id));
  await batchDeleteFileWithRetry(linkFPaths, 0);

  if (params.doDeleteStaticFiles) await deleteStaticFiles(ids);

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
  await deleteStaticFiles(ids);

  return { listName: TRASH, ids };
};

const updateSettings = async (settings) => {
  const fpaths = [`${SETTINGS}${DOT_JSON}`];
  const contents = [settings];

  await batchPutFileWithRetry(fpaths, contents, 0);
};

const canDeleteListNames = async (listNames) => {

  const { linkFPaths } = await listFPaths();
  const inUseListNames = Object.keys(linkFPaths);

  const canDeletes = [];
  for (const listName of listNames) {
    canDeletes.push(!inUseListNames.includes(listName));
  }

  return canDeletes;
};

const putPins = async (params) => {
  const { pins } = params;

  const fpaths = [], contents = [];
  for (const pin of pins) {
    fpaths.push(createPinFPath(pin.rank, pin.updatedDT, pin.addedDT, pin.id));
    contents.push({});
  }

  await batchPutFileWithRetry(fpaths, contents, 0);
  return { pins };
};

const deletePins = async (params) => {

  const { pins } = params;
  const pinFPaths = pins.map(pin => {
    return createPinFPath(pin.rank, pin.updatedDT, pin.addedDT, pin.id);
  });
  await batchDeleteFileWithRetry(pinFPaths, 0);

  return { pins };
};

const updateCustomData = async (params) => {
  const { listName, fromLink, toLink } = params;

  const {
    usedFPaths, serverUnusedFPaths, localUnusedFPaths,
  } = deriveFPaths(fromLink.custom, toLink.custom);

  const usedFiles = await fileApi.getFiles(usedFPaths);

  // Make sure save static files successfully first
  await batchPutFileWithRetry(usedFiles.fpaths, usedFiles.contents, 0);
  await batchPutFileWithRetry([createLinkFPath(listName, toLink.id)], [toLink], 0);

  try {
    batchDeleteFileWithRetry(serverUnusedFPaths, 0);
    fileApi.deleteFiles(localUnusedFPaths);
  } catch (error) {
    console.log('updateCustomData error: ', error);
    // error in this step should be fine
  }

  return { listName, fromLink, toLink, serverUnusedFPaths, localUnusedFPaths };
};

const blockstack = {
  batchGetFileWithRetry, batchPutFileWithRetry, batchDeleteFileWithRetry,
  canDeleteListNames, deletePins,
};

export default blockstack;
