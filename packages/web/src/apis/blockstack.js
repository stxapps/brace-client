import serverApi from './server';
import fileApi from './localFile';
import { CD_ROOT, DOT_JSON, INFO } from '../types/const';
import {
  FETCH, FETCH_MORE, ADD_LINKS, UPDATE_LINKS, DELETE_LINKS, UPDATE_SETTINGS,
  UPDATE_INFO, PIN_LINK, UNPIN_LINK, UPDATE_CUSTOM_DATA,
} from '../types/actionTypes';
import {
  isObject, isString, randomString, createLinkFPath, extractLinkFPath, createPinFPath,
  addFPath, getStaticFPath, deriveFPaths, createDataFName, getLastSettingsFPaths,
  createSettingsFPath, excludeNotObjContents, batchGetFileWithRetry,
  batchPutFileWithRetry, batchDeleteFileWithRetry, deriveUnknownErrorLink, getLinkFPaths,
  getPinFPaths, getNLinkFPaths, isFetchedLinkId,
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

const fetchStgsAndInfo = async (_settingsFPaths, infoFPath) => {
  let settings, conflictedSettings = [], info;
  const {
    fpaths: settingsFPaths, ids: settingsIds,
  } = getLastSettingsFPaths(_settingsFPaths);

  if (settingsFPaths.length > 0) {
    const files = await serverApi.getFiles(settingsFPaths, true);

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

  return { settings, conflictedSettings, info };
};

const fetchLinks = async (_fpaths) => {
  const responses = await batchGetFileWithRetry(serverApi.getFile, _fpaths, 0, true);

  const fpaths = [], linkObjs = []; // No order guarantee btw _fpaths and responses
  for (const { success, fpath, content } of responses) {
    fpaths.push(fpath);

    if (success) linkObjs.push(content);
    else linkObjs.push(deriveUnknownErrorLink(fpath));
  }

  await fetchStaticFiles(linkObjs);

  const links = {};
  for (let i = 0; i < fpaths.length; i++) {
    const fpath = fpaths[i], link = linkObjs[i];

    const { listName } = extractLinkFPath(fpath);
    if (!isObject(links[listName])) links[listName] = {};
    links[listName][link.id] = link;
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

  const files = await fileApi.getFiles(fpaths); // Check if already exists locally

  const remainedFPaths = [];
  for (let i = 0; i < files.fpaths.length; i++) {
    const fpath = files.fpaths[i], contentUrl = files.contentUrls[i];
    if (isString(contentUrl)) continue;
    remainedFPaths.push(fpath);
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

  await fileApi.putFiles(
    responses.map(r => r.fpath).map(fpath => fpathMap[fpath]),
    responses.map(r => r.content)
  );
};

const fetch = async (params) => {
  const { getState, listName, queryString, lnOrQt } = params;

  const links = getState().links;
  const didFetch = getState().display.didFetch;
  const didFetchSettings = getState().display.didFetchSettings;
  const pendingPins = getState().pendingPins;

  let doDescendingOrder = getState().settings.doDescendingOrder;

  const linkFPaths = getLinkFPaths(getState());
  const pinFPaths = getPinFPaths(getState());

  // Need to do it again in case fetch list1 and fetch list2,
  //   the second fetch, settings are changes.
  const bin = { fetchedLinkFPaths: [], unfetchedLinkFPaths: [], hasMore: false };
  if (didFetch && didFetchSettings) {
    let fpaths;
    if (queryString) {
      // Loop on tagFPaths, get linkIds with tag === queryString
      [fpaths, bin.hasMore] = [[], false];
    } else {
      const _result = getNLinkFPaths({
        linkFPaths, listName, doDescendingOrder, pinFPaths, pendingPins,
      });
      [fpaths, bin.hasMore] = [_result.fpaths, _result.hasMore];
    }
    for (const linkFPath of fpaths) {
      const etRs = extractLinkFPath(linkFPath);
      if (isFetchedLinkId(vars.fetch.fetchedLinkIds, links, etRs.listName, etRs.id)) {
        bin.fetchedLinkFPaths.push(linkFPath);
      } else {
        bin.unfetchedLinkFPaths.push(linkFPath);
      }
    }
  }

  const result = { lnOrQt };
  if (!didFetch || !didFetchSettings) {
    const {
      linkFPaths, settingsFPaths, infoFPath, pinFPaths,
    } = await listFPaths(true);

    const sResult = await fetchStgsAndInfo(settingsFPaths, infoFPath);
    result.doFetchStgsAndInfo = true;
    result.settings = sResult.settings;
    result.conflictedSettings = sResult.conflictedSettings;
    result.info = sResult.info;
    // List names should be retrieve from settings
    //   but also retrive from file paths in case the settings is gone.
    result.listNames = Object.keys(linkFPaths);

    if (result.settings) doDescendingOrder = result.settings.doDescendingOrder;

    let fpaths;
    if (queryString) {
      // Loop on tagFPaths, get linkIds with tag === queryString
      [fpaths, bin.hasMore] = [[], false];
    } else {
      const _result = getNLinkFPaths({
        linkFPaths, listName, doDescendingOrder, pinFPaths, pendingPins,
      });
      [fpaths, bin.hasMore] = [_result.fpaths, _result.hasMore];
    }
    for (const linkFPath of fpaths) bin.unfetchedLinkFPaths.push(linkFPath);

    vars.fetch.dt = Date.now();
  }

  const lResult = await fetchLinks(bin.unfetchedLinkFPaths);
  result.fetchedLinkFPaths = bin.fetchedLinkFPaths;
  result.unfetchedLinkFPaths = bin.unfetchedLinkFPaths;
  result.hasMore = bin.hasMore;
  result.links = lResult.links;

  return result;
};

const fetchMore = async (params) => {
  const { getState, doForCompare, listName, queryString, lnOrQt, safLinkIds } = params;

  const links = getState().links;
  const pendingPins = getState().pendingPins;
  const doDescendingOrder = getState().settings.doDescendingOrder;

  const linkFPaths = getLinkFPaths(getState());
  const pinFPaths = getPinFPaths(getState());

  // Need to do it again in case settings are changes.
  let fpaths;
  const bin = {
    fetchedLinkFPaths: [], unfetchedLinkFPaths: [], hasMore: false, hasDisorder: false,
  };
  if (doForCompare) {
    if (queryString) {
      console.log(
        'In blockstack.fetchMore, invalid doForCompare:', doForCompare,
        'with queryString:', queryString
      );
      [fpaths, bin.hasMore] = [[], false];
    } else {
      const _result = getNLinkFPaths({
        linkFPaths, listName, doDescendingOrder, pinFPaths, pendingPins,
        excludingIds: safLinkIds,
      });
      fpaths = _result.fpaths;
      [bin.hasMore, bin.hasDisorder] = [_result.hasMore, _result.hasDisorder];
    }
  } else {
    if (queryString) {

      // Loop on tagFPaths, get linkIds with tag === queryString
      // excluding already showing
      [fpaths, bin.hasMore, bin.hasDisorder] = [[], false, false];
    } else {
      const _result = getNLinkFPaths({
        linkFPaths, listName, doDescendingOrder, pinFPaths, pendingPins,
        excludingIds: safLinkIds,
      });
      fpaths = _result.fpaths;
      [bin.hasMore, bin.hasDisorder] = [_result.hasMore, _result.hasDisorder];
    }
  }
  for (const linkFPath of fpaths) {
    const etRs = extractLinkFPath(linkFPath);
    if (isFetchedLinkId(vars.fetch.fetchedLinkIds, links, etRs.listName, etRs.id)) {
      bin.fetchedLinkFPaths.push(linkFPath);
    } else {
      bin.unfetchedLinkFPaths.push(linkFPath);
    }
  }

  const lResult = await fetchLinks(bin.unfetchedLinkFPaths);
  const result = {
    lnOrQt,
    doForCompare,
    fetchedLinkFPaths: bin.fetchedLinkFPaths,
    unfetchedLinkFPaths: bin.unfetchedLinkFPaths,
    hasMore: bin.hasMore,
    hasDisorder: bin.hasDisorder,
    links: lResult.links,
  }
  return result;
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

  // Beware size should be max at N_LINKS, so can call batchPutFileWithRetry directly.
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
