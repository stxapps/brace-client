import { diffLinesRaw, DIFF_EQUAL, DIFF_DELETE, DIFF_INSERT } from 'jest-diff';
import { LexoRank } from '@wewatch/lexorank';

import serverApi from './server';
import cacheApi from './localCache';
import fileApi from './localFile';
import axios from '../axiosWrapper';
import {
  FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, MOVE_LINKS_ADD_STEP, DELETE_LINKS,
  EXTRACT_CONTENTS, TRY_UPDATE_SETTINGS, UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT,
  UPDATE_SETTINGS_ROLLBACK, UPDATE_UNCHANGED_SETTINGS, TRY_UPDATE_INFO, UPDATE_INFO,
  UPDATE_INFO_COMMIT, UPDATE_INFO_ROLLBACK, UPDATE_UNCHANGED_INFO, PIN_LINK, UNPIN_LINK,
  UPDATE_CUSTOM_DATA, UPDATE_TAG_DATA_S_STEP, UPDATE_TAG_DATA_T_STEP,
} from '../types/actionTypes';
import {
  LINKS, SSLTS, SETTINGS, INFO, PINS, TAGS, CD_ROOT, DOT_JSON, LOCAL_LINK_ATTRS,
  BRACE_EXTRACT_URL, EXTRACT_INIT, EXTRACT_EXCEEDING_N_URLS, N_LINKS,
} from '../types/const';
import {
  isEqual, isObject, isString, isNumber, randomString, createLinkFPath, createSsltFPath,
  createPinFPath, addFPath, getStaticFPath, deriveFPaths, createDataFName,
  getLastSettingsFPaths, createSettingsFPath, excludeNotObjContents,
  batchGetFileWithRetry, batchPutFileWithRetry, batchDeleteFileWithRetry,
  deriveUnknownErrorLink, getLinkFPaths, getSsltFPaths, getPinFPaths, listLinkMetas,
  getNLinkMetas, isFetchedLinkId, getInUseTagNames, getTagFPaths, getTags, getMainId,
  createTagFPath, extractTagFPath, getNLinkMetasByQt, newObject, getListNameAndLink,
  getListNamesFromLinkMetas,
} from '../utils';
import vars from '../vars';

const DIFF_UPDATE = 'DIFF_UPDATE';

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

  if (method === MOVE_LINKS_ADD_STEP) {
    return moveLinks(params);
  }

  if (method === DELETE_LINKS) {
    return deleteLinks(params);
  }

  if (method === EXTRACT_CONTENTS) {
    return extractContents(params);
  }

  if (method === TRY_UPDATE_SETTINGS) {
    return tryPutSettings(params);
  }

  if (method === UPDATE_SETTINGS) {
    return putSettings(params);
  }

  if (method === TRY_UPDATE_INFO) {
    return tryPutInfo(params);
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

  if (method === UPDATE_TAG_DATA_S_STEP) {
    return updateTagDataSStep(params);
  }

  if (method === UPDATE_TAG_DATA_T_STEP) {
    return updateTagDataTStep(params);
  }

  throw new Error(`${method} is invalid for blockstack effect.`);
};

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

const fetchStgsAndInfo = async (_settingsFPaths, infoFPath) => {
  let settings, conflictedSettings = [], info;
  const {
    fpaths: settingsFPaths, ids: settingsIds,
  } = getLastSettingsFPaths(_settingsFPaths);

  if (settingsFPaths.length > 0) {
    const files = await getFiles(settingsFPaths, true);

    // content can be null if dangerouslyIgnoreError is true.
    const { fpaths, contents } = excludeNotObjContents(files.fpaths, files.contents);
    for (let i = 0; i < fpaths.length; i++) {
      const [fpath, content] = [fpaths[i], contents[i]];
      if (fpaths.length === 1) {
        settings = content;
        continue;
      }
      conflictedSettings.push({
        ...content, id: settingsIds[settingsFPaths.indexOf(fpath)], fpath,
      });
    }
  }

  if (infoFPath) {
    const { contents } = await getFiles([infoFPath], true);
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
  if (isObject(settings)) {
    if ('purchases' in settings) settings.purchases = null;
    if ('checkPurchasesDT' in settings) settings.checkPurchasesDT = null;
  }
  for (const cSettings of conflictedSettings) {
    if ('purchases' in cSettings) cSettings.purchases = null;
    if ('checkPurchasesDT' in cSettings) cSettings.checkPurchasesDT = null;
  }

  return { settings, conflictedSettings, info };
};

const fetchLinks = async (metas) => {
  const fpaths = [];
  for (const meta of metas) fpaths.push(...meta.fpaths);

  const { responses } = await getFiles(fpaths, true);

  const ftcMap = {}; // No order guarantee btw fpaths and responses
  for (const { success, fpath, content } of responses) {
    const derivedContent = success ? content : deriveUnknownErrorLink(fpath);
    ftcMap[fpath] = derivedContent;
  }

  await fetchStaticFiles(Object.values(ftcMap));

  const links = {};
  for (const meta of metas) {
    const { id, fpaths: mFPaths, listName } = meta;

    let content;
    for (const fpath of mFPaths) content = ftcMap[fpath];
    if (!isObject(content)) {
      console.log('In fetchLinks, invalid content', mFPaths, ftcMap);
      continue;
    }

    if (!isObject(links[listName])) links[listName] = {};
    links[listName][id] = content;
  }

  return { links };
};

const fetchStaticFiles = async (linkObjs) => {
  const fpaths = [];
  for (const link of linkObjs) {
    if (isObject(link.custom)) {
      const { image } = link.custom;
      if (isString(image) && image.startsWith(CD_ROOT + '/')) {
        fpaths.push(image);
      }
    }
  }

  const remainFPaths = [];
  for (const fpath of fpaths) {
    const { contentUrl } = await fileApi.getFile(fpath);
    if (isString(contentUrl)) continue; // Check if already exists locally
    remainFPaths.push(fpath);
  }

  const fpathMap = {}, remainStaticFPaths = [];
  for (const fpath of remainFPaths) {
    let staticFPath = getStaticFPath(fpath);
    if (vars.platform.isReactNative) staticFPath = 'file://' + staticFPath;

    fpathMap[staticFPath] = fpath;
    remainStaticFPaths.push(staticFPath);
  }

  const sFiles = await getFiles(remainStaticFPaths, true);
  for (let i = 0; i < sFiles.fpaths.length; i++) {
    if (sFiles.contents[i] === null) continue;
    await fileApi.putFile(fpathMap[sFiles.fpaths[i]], sFiles.contents[i]);
  }
};

const fetch = async (params) => {
  const { getState, listName, queryString, lnOrQt, fthId } = params;

  const links = getState().links;
  const didFetch = getState().display.didFetch;
  const didFetchSettings = getState().display.didFetchSettings;
  const doForceLock = getState().display.doForceLock;
  const pendingSslts = getState().pendingSslts;
  const pendingPins = getState().pendingPins;
  const pendingTags = getState().pendingTags;
  const lockedLists = getState().lockSettings.lockedLists;

  let doDescendingOrder = getState().settings.doDescendingOrder;

  // Need to do it again in case fetch list1 and fetch list2,
  //   the second fetch, settings are changes.
  const bin = { fetchedLinkMetas: [], unfetchedLinkMetas: [], hasMore: false };
  if (didFetch && didFetchSettings) {
    const linkFPaths = getLinkFPaths(getState());
    const ssltFPaths = getSsltFPaths(getState());
    const pinFPaths = getPinFPaths(getState());
    const tagFPaths = getTagFPaths(getState());

    let metas;
    if (queryString) {
      const _result = getNLinkMetasByQt({
        linkFPaths, ssltFPaths, pendingSslts, links, doDescendingOrder, pinFPaths,
        pendingPins, tagFPaths, pendingTags, doForceLock, lockedLists, queryString,
      });
      [metas, bin.hasMore] = [_result.metas, _result.hasMore];
    } else {
      const _result = getNLinkMetas({
        linkFPaths, ssltFPaths, pendingSslts, links, listName, doDescendingOrder,
        pinFPaths, pendingPins,
      });
      [metas, bin.hasMore] = [_result.metas, _result.hasMore];
    }
    for (const meta of metas) {
      if (isFetchedLinkId(vars.fetch.fetchedLinkIds, links, meta.listName, meta.id)) {
        bin.fetchedLinkMetas.push(meta);
      } else {
        bin.unfetchedLinkMetas.push(meta);
      }
    }
  }

  const result = { lnOrQt, fthId };
  if (!didFetch || !didFetchSettings) {
    const {
      linkFPaths, ssltFPaths, settingsFPaths, infoFPath, pinFPaths, tagFPaths,
    } = await listFPaths(true);

    const { linkMetas } = listLinkMetas(linkFPaths, ssltFPaths, pendingSslts);

    const sResult = await fetchStgsAndInfo(settingsFPaths, infoFPath);
    result.doFetchStgsAndInfo = true;
    result.settings = sResult.settings;
    result.conflictedSettings = sResult.conflictedSettings;
    result.info = sResult.info;
    // List names should be retrieve from settings
    //   but also retrive from file paths in case the settings is gone.
    result.listNames = getListNamesFromLinkMetas(linkMetas);
    result.tagNames = getInUseTagNames(linkMetas, tagFPaths);

    if (result.settings) doDescendingOrder = result.settings.doDescendingOrder;

    let metas;
    if (queryString) {
      const _result = getNLinkMetasByQt({
        linkFPaths, ssltFPaths, pendingSslts, links, doDescendingOrder, pinFPaths,
        pendingPins, tagFPaths, pendingTags, doForceLock, lockedLists, queryString,
      });
      [metas, bin.hasMore] = [_result.metas, _result.hasMore];
    } else {
      const _result = getNLinkMetas({
        linkFPaths, ssltFPaths, pendingSslts, links, listName, doDescendingOrder,
        pinFPaths, pendingPins,
      });
      [metas, bin.hasMore] = [_result.metas, _result.hasMore];
    }
    for (const meta of metas) bin.unfetchedLinkMetas.push(meta);

    vars.fetch.dt = Date.now();
  }

  const lResult = await fetchLinks(bin.unfetchedLinkMetas);
  result.fetchedLinkMetas = bin.fetchedLinkMetas;
  result.unfetchedLinkMetas = bin.unfetchedLinkMetas;
  result.hasMore = bin.hasMore;
  result.links = lResult.links;

  return result;
};

const fetchMore = async (params) => {
  const {
    getState, doForCompare, listName, queryString, lnOrQt, fthId, safLinkIds,
  } = params;

  const links = getState().links;
  const doForceLock = getState().display.doForceLock;
  const pendingSslts = getState().pendingSslts;
  const pendingPins = getState().pendingPins;
  const pendingTags = getState().pendingTags;
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const lockedLists = getState().lockSettings.lockedLists;

  const linkFPaths = getLinkFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const pinFPaths = getPinFPaths(getState());
  const tagFPaths = getTagFPaths(getState());

  // Need to do it again in case settings are changes.
  let metas;
  const bin = {
    fetchedLinkMetas: [], unfetchedLinkMetas: [], hasMore: false, hasDisorder: false,
  };
  if (doForCompare) {
    if (queryString) {
      console.log(
        'In blockstack.fetchMore, invalid doForCompare:', doForCompare,
        'with queryString:', queryString
      );
      [metas, bin.hasMore] = [[], false];
    } else {
      const _result = getNLinkMetas({
        linkFPaths, ssltFPaths, pendingSslts, links, listName, doDescendingOrder,
        pinFPaths, pendingPins, excludingIds: safLinkIds,
      });
      metas = _result.metas;
      [bin.hasMore, bin.hasDisorder] = [_result.hasMore, _result.hasDisorder];
    }
  } else {
    if (queryString) {
      const _result = getNLinkMetasByQt({
        linkFPaths, ssltFPaths, pendingSslts, links, doDescendingOrder, pinFPaths,
        pendingPins, tagFPaths, pendingTags, doForceLock, lockedLists, queryString,
        excludingIds: safLinkIds,
      });
      metas = _result.metas;
      [bin.hasMore, bin.hasDisorder] = [_result.hasMore, _result.hasDisorder];
    } else {
      const _result = getNLinkMetas({
        linkFPaths, ssltFPaths, pendingSslts, links, listName, doDescendingOrder,
        pinFPaths, pendingPins, excludingIds: safLinkIds,
      });
      metas = _result.metas;
      [bin.hasMore, bin.hasDisorder] = [_result.hasMore, _result.hasDisorder];
    }
  }
  for (const meta of metas) {
    if (isFetchedLinkId(vars.fetch.fetchedLinkIds, links, meta.listName, meta.id)) {
      bin.fetchedLinkMetas.push(meta);
    } else {
      bin.unfetchedLinkMetas.push(meta);
    }
  }

  const lResult = await fetchLinks(bin.unfetchedLinkMetas);
  const result = {
    doForCompare,
    lnOrQt,
    fthId,
    fetchedLinkMetas: bin.fetchedLinkMetas,
    unfetchedLinkMetas: bin.unfetchedLinkMetas,
    hasMore: bin.hasMore,
    hasDisorder: bin.hasDisorder,
    links: lResult.links,
  };
  return result;
};

const putLinks = async (params) => {
  const { listNames, links, manuallyManageError } = params;

  const fpaths = [], contents = [], linkMap = {};
  for (let i = 0; i < listNames.length; i++) {
    const [listName, link] = [listNames[i], links[i]];
    const fpath = createLinkFPath(listName, link.id);
    fpaths.push(fpath);
    contents.push(newObject(link, LOCAL_LINK_ATTRS));
    linkMap[fpath] = { listName, link };
  }

  const successListNames = [], successLinks = [];
  const errorListNames = [], errorLinks = [], errors = [];

  // Use dangerouslyIgnoreError=true to manage which succeeded/failed manually.
  const { responses } = await putFiles(fpaths, contents, !!manuallyManageError);
  for (const response of responses) {
    const { listName, link } = linkMap[response.fpath];
    if (response.success) {
      successListNames.push(listName);
      successLinks.push(link);
    } else {
      errorListNames.push(listName);
      errorLinks.push(link);
      errors.push(response.error);
    }
  }

  return { successListNames, successLinks, errorListNames, errorLinks, errors };
};

const moveLinks = async (params) => {
  const { listNames, links, manuallyManageError } = params;

  let now = Date.now();

  const fpaths = [], contents = [], linkMap = {};
  for (let i = 0; i < listNames.length; i++) {
    const [listName, link] = [listNames[i], links[i]];
    const fpath = createSsltFPath(listName, now, now, link.id);
    fpaths.push(fpath);
    contents.push({});
    linkMap[fpath] = { listName, link };
    now += 1;
  }

  const successListNames = [], successLinks = [];
  const errorListNames = [], errorLinks = [], errors = [];

  const { responses } = await putFiles(fpaths, contents, !!manuallyManageError);
  for (const response of responses) {
    const { listName, link } = linkMap[response.fpath];
    if (response.success) {
      successListNames.push(listName);
      successLinks.push(link);
    } else {
      errorListNames.push(listName);
      errorLinks.push(link);
      errors.push(response.error);
    }
  }

  return { successListNames, successLinks, errorListNames, errorLinks, errors };
};

const deleteLinks = async (params) => {
  const { listNames, ids, manuallyManageError, fpathsPerId, prevFPathsPerId } = params;

  const lnMap = {};
  for (let i = 0; i < listNames.length; i++) {
    const [listName, id] = [listNames[i], ids[i]];
    lnMap[id] = listName;
  }

  const idMap = {}, prevFPaths = [], fpaths = [];
  for (const id in prevFPathsPerId) {
    const listName = lnMap[id];
    for (const fpath of prevFPathsPerId[id]) {
      idMap[fpath] = { listName, id };
      if (!prevFPaths.includes(fpath)) prevFPaths.push(fpath);
    }
  }

  const _successListNames = [], _successIds = [];
  const successListNames = [], successIds = [];
  const errorListNames = [], errorIds = [], errors = [];

  // try to delete previous fpaths first.
  const {
    responses: pResponses,
  } = await deleteFiles(prevFPaths, !!manuallyManageError);

  for (const response of pResponses) {
    const { listName, id } = idMap[response.fpath];
    if (!response.success) {
      if (!errorIds.includes(id)) {
        errorListNames.push(listName);
        errorIds.push(id);
        errors.push(response.error);
      }
    }
  }

  for (let i = 0; i < listNames.length; i++) {
    const [listName, id] = [listNames[i], ids[i]];
    if (errorIds.includes(id)) continue;

    if (isObject(fpathsPerId) && Array.isArray(fpathsPerId[id])) {
      for (const fpath of fpathsPerId[id]) {
        idMap[fpath] = { listName, id };
        if (!fpaths.includes(fpath)) fpaths.push(fpath);
      }
    } else {
      console.log(`In deleteLinks, for ${id}, invalid fpathsPerId`, fpathsPerId);
      const fpath = createLinkFPath(listName, id);
      idMap[fpath] = { listName, id };
      if (!fpaths.includes(fpath)) fpaths.push(fpath);
    }
  }

  const { responses } = await deleteFiles(fpaths, !!manuallyManageError);
  for (const response of responses) {
    const { listName, id } = idMap[response.fpath];
    if (response.success) {
      if (!_successIds.includes(id)) {
        _successListNames.push(listName);
        _successIds.push(id);
      }
    } else {
      if (!errorIds.includes(id)) {
        errorListNames.push(listName);
        errorIds.push(id);
        errors.push(response.error);
      }
    }
  }
  for (let i = 0; i < _successListNames.length; i++) {
    const [listName, id] = [_successListNames[i], _successIds[i]];
    if (errorIds.includes(id)) continue;
    successListNames.push(listName);
    successIds.push(id);
  }

  return { successListNames, successIds, errorListNames, errorIds, errors };
};

const extractContents = async (params) => {
  const { toListNames, toLinks } = params;

  const urls = toLinks.map(link => link.url);
  const res = await axios.post(BRACE_EXTRACT_URL, { urls });
  const extractedResults = res.data.extractedResults;

  let updatedDT = Date.now();

  const extractedListNames = [], extractedLinks = [];
  for (let i = 0; i < extractedResults.length; i++) {
    const extractedResult = extractedResults[i];
    if (
      extractedResult.status === EXTRACT_INIT ||
      extractedResult.status === EXTRACT_EXCEEDING_N_URLS
    ) continue;

    const [toListName, toLink] = [toListNames[i], toLinks[i]];

    const eId = `${getMainId(toLink.id)}-${randomString(4)}-${updatedDT}`;
    const eLink = { ...toLink, id: eId, extractedResult, fromId: toLink.id };
    updatedDT += 1;

    extractedListNames.push(toListName);
    extractedLinks.push(eLink);
  }

  const pResult = await putLinks({
    listNames: extractedListNames, links: extractedLinks, manuallyManageError: true,
  });

  return { toListNames, toLinks, extractedListNames, extractedLinks, ...pResult };
};

const tryPutSettings = async (params) => {
  const { dispatch, getState } = params;

  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;

  // Need to compare with the snapshot here to have the latest version.
  //   e.g., change settings -> close the popup -> open it and change again.
  if (isEqual(settings, snapshotSettings)) {
    dispatch({ type: UPDATE_UNCHANGED_SETTINGS });
    return {};
  }

  const doFetch = settings.doDescendingOrder !== snapshotSettings.doDescendingOrder;

  dispatch({ type: UPDATE_SETTINGS });
  try {
    const res = await putSettings({ settings });
    dispatch({ type: UPDATE_SETTINGS_COMMIT, payload: { ...res, doFetch } });
  } catch (error) {
    dispatch({ type: UPDATE_SETTINGS_ROLLBACK, payload: { error } });
  }

  return {};
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

  await putFiles([settingsFPath], [settings]);
  return { settings, _settingsFPaths };
};

const tryPutInfo = async (params) => {
  const { dispatch, getState } = params;

  const info = getState().info;
  const snapshotInfo = getState().snapshot.info;

  // Need to compare with the snapshot here to have the latest version.
  if (isEqual(info, snapshotInfo)) {
    dispatch({ type: UPDATE_UNCHANGED_INFO });
    return {};
  }

  dispatch({ type: UPDATE_INFO });
  try {
    const res = await putInfo({ info });
    dispatch({ type: UPDATE_INFO_COMMIT, payload: { ...res } });
  } catch (error) {
    dispatch({ type: UPDATE_INFO_ROLLBACK, payload: { error } });
  }

  return {};
};

const putInfo = async (params) => {
  const { info } = params;
  const { infoFPath: _infoFPath } = await listFPaths();

  const addedDT = Date.now();
  const infoFPath = `${INFO}${addedDT}${DOT_JSON}`;

  await putFiles([infoFPath], [info]);
  return { info, _infoFPath };
};

const putPins = async (params) => {
  const { getState, pins } = params;

  // Add to the fetched only if also exists in fpaths to prevent pin on a link
  //   that was already moved/removed/deleted.
  const pListNames = [], pLinks = [];
  if (getState) {
    const pendingSslts = getState().pendingSslts;

    const linkFPaths = getLinkFPaths(getState());
    const ssltFPaths = getSsltFPaths(getState());

    const { linkMetas } = listLinkMetas(linkFPaths, ssltFPaths, pendingSslts);

    const links = getState().links;
    for (const { id } of pins) {
      const { listName, link } = getListNameAndLink(id, links);
      if (!isString(listName) || !isObject(link)) {
        console.log('In putPins, no found listName or link for id:', id);
        continue;
      }

      let found = false;
      for (const meta of linkMetas) {
        if (meta.listName !== listName || meta.id !== id) continue;
        found = true;
        break;
      }
      if (!found) continue;

      const [pListName, pLink] = [listName, newObject(link, LOCAL_LINK_ATTRS)];
      pListNames.push(pListName);
      pLinks.push(pLink);
    }
  }

  const fpaths = [], contents = [];
  for (const pin of pins) {
    fpaths.push(createPinFPath(pin.rank, pin.updatedDT, pin.addedDT, pin.id));
    contents.push({});
  }
  // Use dangerouslyIgnoreError=true to manage which succeeded/failed manually.
  // Bug alert: if several pins and error, rollback is incorrect
  //   as some are successful but some aren't.
  await putFiles(fpaths, contents);

  return { listNames: pListNames, links: pLinks, pins };
};

const deletePins = async (params) => {
  const { pins } = params;

  const pinFPaths = pins.map(pin => {
    return createPinFPath(pin.rank, pin.updatedDT, pin.addedDT, pin.id);
  });
  await deleteFiles(pinFPaths);

  return { pins };
};

const updateCustomData = async (params) => {
  const { listName, fromLink, toLink } = params;

  const {
    usedFPaths, serverUnusedFPaths, localUnusedFPaths,
  } = deriveFPaths(fromLink.custom, toLink.custom);

  const staticFPaths = [], staticContents = [];
  for (const fpath of usedFPaths) {
    if (vars.platform.isReactNative) {
      staticFPaths.push('file://' + fpath);
      staticContents.push('');
    } else {
      const { content } = await fileApi.getFile(fpath);
      staticFPaths.push(fpath);
      staticContents.push(content);
    }
  }

  // Make sure save static files successfully first
  await putFiles(staticFPaths, staticContents);
  await putFiles(
    [createLinkFPath(listName, toLink.id)], [newObject(toLink, LOCAL_LINK_ATTRS)]
  );

  return { listName, fromLink, toLink, serverUnusedFPaths, localUnusedFPaths };
};

const updateTagDataSStep = async (params) => {
  const { getState } = params;

  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;

  const result = {};
  if (!isEqual(settings, snapshotSettings)) {
    const doFetch = settings.doDescendingOrder !== snapshotSettings.doDescendingOrder;

    const sResult = await putSettings({ settings });
    result.doUpdateSettings = true;
    result.settings = sResult.settings;
    result._settingsFPaths = sResult._settingsFPaths;
    result.doFetch = doFetch;
  }

  return result;
};

const updateTagDataTStep = async (params) => {
  const { getState, id, values } = params;

  const tagFPaths = getTagFPaths(getState());
  const solvedTags = getTags(tagFPaths, {});
  const mainId = getMainId(id);

  const combinedValues = {}, aTns = [], bTns = [];
  if (isObject(solvedTags[mainId])) {
    for (const value of solvedTags[mainId].values) {
      combinedValues[value.tagName] = { ...value, diffs: [] };
      aTns.push(value.tagName);
    }
  }
  for (const value of values) {
    combinedValues[value.tagName] = { ...combinedValues[value.tagName], diffs: [] };
    bTns.push(value.tagName);
  }

  const diffs = diffLinesRaw(aTns, bTns);
  for (const diff of diffs) {
    const [diffType, tn] = [diff[0], diff[1]];
    combinedValues[tn].diffs.push(diffType);
  }
  for (const tn in combinedValues) {
    const tDiffs = combinedValues[tn].diffs;
    if (tDiffs.length === 1 && tDiffs.includes(DIFF_EQUAL)) {
      combinedValues[tn].diffType = DIFF_EQUAL;
    } else if (tDiffs.length === 1 && tDiffs.includes(DIFF_DELETE)) {
      combinedValues[tn].diffType = DIFF_DELETE;
    } else if (tDiffs.length === 1 && tDiffs.includes(DIFF_INSERT)) {
      combinedValues[tn].diffType = DIFF_INSERT;
    } else if (
      tDiffs.length === 2 &&
      tDiffs.includes(DIFF_INSERT) &&
      tDiffs.includes(DIFF_DELETE)
    ) {
      combinedValues[tn].diffType = DIFF_UPDATE;
    } else {
      console.log('Found invalid diffs for tn:', tn, tDiffs);
    }
  }

  const bRanks = [];
  for (const tn of bTns) {
    const diffType = combinedValues[tn].diffType;
    if (diffType === DIFF_EQUAL) {
      bRanks.push(combinedValues[tn].rank);
      continue;
    }
    bRanks.push(null);
  }
  for (let i = 0; i < bRanks.length; i++) {
    if (isString(bRanks[i])) continue;

    let prevRank, nextRank;
    for (let j = i - 1; j >= 0; j--) {
      if (isString(bRanks[j])) {
        prevRank = bRanks[j];
        break;
      }
    }
    for (let j = i + 1; j < bRanks.length; j++) {
      if (isString(bRanks[j])) {
        nextRank = bRanks[j];
        break;
      }
    }

    let lexoRank;
    if (isString(prevRank) && isString(nextRank)) {
      const pLexoRank = LexoRank.parse(`0|${prevRank.replace('_', ':')}`);
      const nLexoRank = LexoRank.parse(`0|${nextRank.replace('_', ':')}`);

      if (prevRank === nextRank) lexoRank = pLexoRank;
      else lexoRank = pLexoRank.between(nLexoRank);
    } else if (isString(prevRank)) {
      lexoRank = LexoRank.parse(`0|${prevRank.replace('_', ':')}`).genNext();
    } else if (isString(nextRank)) {
      lexoRank = LexoRank.parse(`0|${nextRank.replace('_', ':')}`).genPrev();
    } else {
      lexoRank = LexoRank.middle();
    }
    bRanks[i] = lexoRank.toString().slice(2).replace(':', '_');
  }
  for (let i = 0; i < bTns.length; i++) {
    combinedValues[bTns[i]].rank = bRanks[i];
  }

  let now = Date.now();

  const fpaths = [], contents = [], deletedTagNames = [];
  for (const tagName in combinedValues) {
    const value = combinedValues[tagName];

    if (value.diffType === DIFF_EQUAL) continue;
    if (value.diffType === DIFF_DELETE) {
      deletedTagNames.push(tagName);
      continue;
    }

    const addedDT = isNumber(value.addedDT) ? value.addedDT : now;
    fpaths.push(createTagFPath(tagName, value.rank, now, addedDT, id));
    contents.push({});
    now += 1;
  }
  await putFiles(fpaths, contents);

  // MainId is the same, but id can be different.
  // Old paths might not be deleted, need to delete them all.
  const deleteFPaths = [];
  for (const fpath of tagFPaths) {
    const eResult = extractTagFPath(fpath);
    if (getMainId(eResult.id) === mainId && deletedTagNames.includes(eResult.tagName)) {
      deleteFPaths.push(createTagFPath(
        eResult.tagName, eResult.rank, eResult.updatedDT, eResult.addedDT, eResult.id
      ));
    }
  }
  await deleteFiles(deleteFPaths);

  return { id, values };
};

const deleteTags = async (params) => {
  const { tagFPaths } = params;
  await deleteFiles(tagFPaths);
  return { tagFPaths };
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

  for (let i = 0, j = remainFPaths.length; i < j; i += N_LINKS) {
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

const putFiles = async (fpaths, contents, dangerouslyIgnoreError = false) => {
  const result = { responses: [] };

  for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
    const selectedFPaths = fpaths.slice(i, i + N_LINKS);
    const selectedContents = contents.slice(i, i + N_LINKS);
    const responses = await batchPutFileWithRetry(
      serverApi.putFile, selectedFPaths, selectedContents, 0, dangerouslyIgnoreError
    );
    for (const response of responses) {
      result.responses.push(response);

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

const deleteFiles = async (fpaths, dangerouslyIgnoreError = false) => {
  const result = { responses: [] };

  for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
    const selectedFPaths = fpaths.slice(i, i + N_LINKS);
    const responses = await batchDeleteFileWithRetry(
      serverApi.deleteFile, selectedFPaths, 0, dangerouslyIgnoreError
    );
    for (const response of responses) {
      result.responses.push(response);

      if (response.success) {
        const { fpath } = response;
        if (
          [LINKS, SSLTS, SETTINGS, INFO, PINS, TAGS].some(el => fpath.startsWith(el))
        ) {
          await cacheApi.deleteFile(fpath);
        }
      }
    }
  }

  return result;
};

const blockstack = {
  listFPaths, deletePins, deleteTags, getFiles, putFiles, deleteFiles,
};

export default blockstack;
