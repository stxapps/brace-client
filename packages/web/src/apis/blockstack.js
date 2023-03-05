import serverApi from './server';
import fileApi from './localFile';
import { N_LINKS, N_DAYS, TRASH, CD_ROOT, DOT_JSON, INFO } from '../types/const';
import {
  FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, DELETE_LINKS, DELETE_OLD_LINKS_IN_TRASH,
  UPDATE_SETTINGS, UPDATE_INFO, PIN_LINK, UNPIN_LINK, UPDATE_CUSTOM_DATA,
} from '../types/actionTypes';
import {
  isObject, isString, randomString, createLinkFPath, extractLinkFPath, createPinFPath,
  addFPath, getMainId, sortWithPins, getStaticFPath, deriveFPaths, createDataFName,
  getLastSettingsFPaths, createSettingsFPath, excludeNotObjContents,
  batchGetFileWithRetry, batchPutFileWithRetry, batchDeleteFileWithRetry,
  deriveUnknownErrorLink,
} from '../utils';
import vars from '../vars';

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
    return putSettings(params);
  }

  if (method === UPDATE_INFO) {
    return putInfo(params);
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

const _listFPaths = async (listFiles) => {
  // List fpaths(keys)
  // Even though aws, az, gc sorts a-z but on Gaia local machine, it's arbitrary
  //   so need to fetch all and sort locally.
  const fpaths = {
    linkFPaths: {}, staticFPaths: [], settingsFPaths: [], infoFPath: null, pinFPaths: [],
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

const fetch = async (params) => {

  let { listName, doDescendingOrder, doFetchStgsAndInfo, pendingPins } = params;
  const {
    linkFPaths, settingsFPaths: _settingsFPaths, infoFPath, pinFPaths,
  } = await listFPaths(doFetchStgsAndInfo);
  const {
    fpaths: settingsFPaths, ids: settingsIds,
  } = getLastSettingsFPaths(_settingsFPaths);

  let settings, conflictedSettings = [], info;
  if (doFetchStgsAndInfo) {
    if (settingsFPaths.length > 0) {
      const files = await serverApi.getFiles(settingsFPaths, true);

      // content can be null if dangerouslyIgnoreError is true.
      const { fpaths, contents } = excludeNotObjContents(files.fpaths, files.contents);
      for (let i = 0; i < fpaths.length; i++) {
        const [fpath, content] = [fpaths[i], contents[i]];
        if (fpaths.length === 1) {
          settings = content;
          doDescendingOrder = settings.doDescendingOrder;
          continue;
        }
        conflictedSettings.push({
          ...content, id: settingsIds[settingsFPaths.indexOf(fpath)], fpath,
        });
      }
    }

    if (infoFPath) {
      const { contents } = await serverApi.getFiles([infoFPath], true);
      if (isObject(contents[0])) info = contents[0];
    }

    // Transition from purchases in settings to info.
    if (isObject(settings) && !isObject(info)) {
      if ('purchases' in settings) {
        info = { purchases: settings.purchases, checkPurchasesDT: null };
        if ('checkPurchasesDT' in settings) {
          info.checkPurchasesDT = settings.checkPurchasesDT;
        }
      }
    }
  }

  const namedLinkFPaths = linkFPaths[listName] || [];
  let sortedLinkFPaths = [...namedLinkFPaths].sort();
  if (doDescendingOrder) sortedLinkFPaths.reverse();

  sortedLinkFPaths = sortWithPins(sortedLinkFPaths, pinFPaths, pendingPins, (fpath) => {
    const { id } = extractLinkFPath(fpath);
    return getMainId(id);
  });
  const selectedLinkFPaths = sortedLinkFPaths.slice(0, N_LINKS);

  const responses = await batchGetFileWithRetry(
    serverApi.getFile, selectedLinkFPaths, 0, true
  );
  const links = [];
  for (const { success, fpath, content } of responses) {
    if (success) links.push(content);
    else links.push(deriveUnknownErrorLink(fpath));
  }
  const hasMore = namedLinkFPaths.length > N_LINKS;

  // List names should be retrieve from settings
  //   but also retrive from file paths in case the settings is gone.
  const listNames = Object.keys(linkFPaths);

  const { images } = await fetchStaticFiles(links);

  return {
    listName, doDescendingOrder, links, hasMore, listNames, doFetchStgsAndInfo, settings,
    conflictedSettings, info, images,
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

  const responses = await batchGetFileWithRetry(
    serverApi.getFile, selectedLinkFPaths, 0, true
  );
  const links = [];
  for (const { success, fpath, content } of responses) {
    if (success) links.push(content);
    else links.push(deriveUnknownErrorLink(fpath));
  }
  const hasMore = filteredLinkFPaths.length > N_LINKS;

  const { images } = await fetchStaticFiles(links);

  return { listName, doDescendingOrder, links, hasMore, hasDisorder, images };
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
    let staticFPath = getStaticFPath(fpath);
    if (vars.platform.isReactNative) staticFPath = 'file://' + staticFPath;

    fpathMap[staticFPath] = fpath;
    remainedStaticFPaths.push(staticFPath);
  }
  const _responses = await batchGetFileWithRetry(
    serverApi.getFile, remainedStaticFPaths, 0, true
  );
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

const putLinks = async (params) => {
  const { listName, links, manuallyManageError } = params;

  const fpaths = [], contents = [], linkMap = {}, successLinks = [], errorLinks = [];
  for (const link of links) {
    const fpath = createLinkFPath(listName, link.id);
    fpaths.push(fpath);
    contents.push(link);
    linkMap[fpath] = link;
  }

  // Beware size should be max at N_NOTES, so can call batchPutFileWithRetry directly.
  // Use dangerouslyIgnoreError=true to manage which succeeded/failed manually.
  const responses = await batchPutFileWithRetry(
    serverApi.putFile, fpaths, contents, 0, !!manuallyManageError
  );
  for (const response of responses) {
    if (response.success) successLinks.push(linkMap[response.fpath]);
    else errorLinks.push({ ...linkMap[response.fpath], error: response.error });
  }

  return { listName, successLinks, errorLinks };
};

const deleteLinks = async (params) => {
  const { listName, ids, manuallyManageError } = params;

  const fpaths = [], idMap = {}, successIds = [], errorIds = [], errors = [];
  for (const id of ids) {
    const fpath = createLinkFPath(listName, id);
    fpaths.push(fpath);
    idMap[fpath] = id;
  }

  const responses = await batchDeleteFileWithRetry(
    serverApi.deleteFile, fpaths, 0, !!manuallyManageError
  );
  for (const response of responses) {
    if (response.success) successIds.push(idMap[response.fpath]);
    else {
      errorIds.push(idMap[response.fpath]);
      errors.push(response.error);
    }
  }

  return { listName, successIds, errorIds, errors };
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

  await serverApi.deleteFiles(oldFPaths);

  return { listName: TRASH, ids };
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

const putSettings = async (params) => {
  const { settings } = params;
  const { settingsFPaths } = await listFPaths();

  const addedDT = Date.now();
  const {
    fpaths: _settingsFPaths, ids: _settingsIds,
  } = getLastSettingsFPaths(settingsFPaths);

  const settingsFName = createDataFName(`${addedDT}${randomString(4)}`, _settingsIds);
  const settingsFPath = createSettingsFPath(settingsFName);

  await serverApi.putFiles([settingsFPath], [settings]);
  return { settings, _settingsFPaths };
};

const putInfo = async (params) => {
  const { info } = params;
  const { infoFPath: _infoFPath } = await listFPaths();

  const addedDT = Date.now();
  const infoFPath = `${INFO}${addedDT}${DOT_JSON}`;

  await serverApi.putFiles([infoFPath], [info]);
  return { info, _infoFPath };
};

const putPins = async (params) => {
  const { pins } = params;

  const fpaths = [], contents = [];
  for (const pin of pins) {
    fpaths.push(createPinFPath(pin.rank, pin.updatedDT, pin.addedDT, pin.id));
    contents.push({});
  }
  // Use dangerouslyIgnoreError=true to manage which succeeded/failed manually.
  // Bug alert: if several pins and error, rollback is incorrect
  //   as some are successful but some aren't.
  await serverApi.putFiles(fpaths, contents);

  return { pins };
};

const deletePins = async (params) => {
  const { pins } = params;

  const pinFPaths = pins.map(pin => {
    return createPinFPath(pin.rank, pin.updatedDT, pin.addedDT, pin.id);
  });
  await serverApi.deleteFiles(pinFPaths);

  return { pins };
};

const updateCustomData = async (params) => {
  const { listName, fromLink, toLink } = params;

  const {
    usedFPaths, serverUnusedFPaths, localUnusedFPaths,
  } = deriveFPaths(fromLink.custom, toLink.custom);

  const usedFiles = await fileApi.getFiles(usedFPaths);
  if (vars.platform.isReactNative) {
    usedFiles.fpaths = usedFiles.fpaths.map(fpath => 'file://' + fpath);
  }

  // Make sure save static files successfully first
  await serverApi.putFiles(usedFiles.fpaths, usedFiles.contents);
  await serverApi.putFiles([createLinkFPath(listName, toLink.id)], [toLink]);

  return { listName, fromLink, toLink, serverUnusedFPaths, localUnusedFPaths };
};

const blockstack = { canDeleteListNames, deletePins };

export default blockstack;
