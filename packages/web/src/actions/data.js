import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
import { saveAs } from 'file-saver';

import axios from '../axiosWrapper';
import dataApi from '../apis/blockstack';
import cacheApi from '../apis/localCache';
import fileApi from '../apis/localFile';
import {
  UPDATE_IMPORT_ALL_DATA_PROGRESS, UPDATE_EXPORT_ALL_DATA_PROGRESS,
  UPDATE_DELETE_ALL_DATA_PROGRESS, DELETE_ALL_DATA,
} from '../types/actionTypes';
import {
  MY_LIST, TRASH, ARCHIVE, LINKS, SSLTS, IMAGES, SETTINGS, PINS, TAGS, DOT_JSON, BASE64,
  LAYOUT_CARD, LAYOUT_LIST, CD_ROOT, PUT_FILE, DELETE_FILE, SD_HUB_URL,
  BRACE_PRE_EXTRACT_URL,
} from '../types/const';
import {
  isEqual, isString, isObject, isNumber, randomString, getUrlFirstChar, randomDecor,
  isDecorValid, isExtractedResultValid, isCustomValid, isListNameObjsValid,
  isTagNameObjsValid, createDataFName, createLinkFPath, createSsltFPath,
  createSettingsFPath, getLastSettingsFPaths, extractFPath, getPins, getMainId,
  getFormattedTimeStamp, extractPinFPath, getStaticFPath, extractTagFPath, getTags,
  listLinkMetas, throwIfPerformFilesError, copyListNameObjs,
  copyListNameObjsWithExactExclude, getAllListNames, copyTagNameObjs,
} from '../utils';
import {
  isUint8Array, isBlob, convertBlobToDataUrl, convertDataUrlToBlob,
} from '../utils/index-web';
import { initialSettingsState } from '../types/initialStates';
import vars from '../vars';

const parseRawImportedFile = async (dispatch, getState, text) => {

  let listName = MY_LIST, now = Date.now();
  const values = [];
  if (text.includes('</a>') || text.includes('</A>')) {
    let start, end;
    for (const match of text.matchAll(/<h[^<]*<\/h|<a[^<]*<\/a>/gi)) {
      const str = match[0];
      if (str.toLowerCase().startsWith('<h')) {
        start = str.indexOf('>');
        if (start < 0) {
          console.log(`Not found > from <h, str: ${str}`);
          continue;
        }
        start += 1;

        end = str.indexOf('<', start);
        if (end < 0) {
          console.log(`Not found < from <h, str: ${str}, start: ${start}`);
          continue;
        }

        const value = str.slice(start, end);
        if (value.toLowerCase().includes(ARCHIVE.toLowerCase())) listName = ARCHIVE;
        else listName = MY_LIST;
        continue;
      }

      if (str.toLowerCase().startsWith('<a')) {
        start = str.toLowerCase().indexOf('href="');
        if (start < 0) {
          console.log(`Not found href= from <a, str: ${str}`);
          continue;
        }
        start += 6;

        end = str.indexOf('"', start);
        if (end < 0) {
          console.log(`Not found " from href, str: ${str}, start: ${start}`);
          continue;
        }

        const url = str.slice(start, end);
        if (url.length === 0) continue;

        let addDate;
        start = str.toLowerCase().indexOf('add_date="');
        if (start > 0) start += 10;
        else {
          start = str.toLowerCase().indexOf('time_added="');
          if (start > 0) start += 12;
        }
        if (start > 0) {
          end = str.indexOf('"', start);
          if (end < 0) {
            console.log(`Not found " from add_date, str: ${str}, start: ${start}`);
            continue;
          }

          addDate = str.slice(start, end);
        }

        let addedDT = now;
        if (addDate && /^\d+$/.test(addDate)) {
          if (addDate.length === 16) addDate = addDate.slice(0, 13);
          if (addDate.length === 10) addDate = addDate + '000';
          const dt = parseInt(addDate, 10);
          if (isNumber(dt)) addedDT = dt;
        }

        const id = `${addedDT}-${randomString(4)}-${randomString(4)}`;
        const decor = randomDecor(getUrlFirstChar(url));
        const link = { id, url, addedDT, decor };
        const fpath = createLinkFPath(listName, link.id);

        values.push({ id: fpath, type: PUT_FILE, path: fpath, content: link });
        now += 1;
        continue;
      }
    }
  } else {
    for (const match of text.matchAll(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi
    )) {
      const url = match[0];
      const addedDT = now;

      const id = `${addedDT}-${randomString(4)}-${randomString(4)}`;
      const decor = randomDecor(getUrlFirstChar(url));
      const link = { id, url, addedDT, decor };
      const fpath = createLinkFPath(listName, link.id);

      values.push({ id: fpath, type: PUT_FILE, path: fpath, content: link });
      now += 1;
    }
  }

  const progress = { total: values.length, done: 0 };
  dispatch(updateImportAllDataProgress(progress));

  if (progress.total === 0) return;

  const nLinks = 30;
  for (let i = 0; i < values.length; i += nLinks) {
    const selectedValues = values.slice(i, i + nLinks);

    const data = { values: selectedValues, isSequential: false, nItemsForNs: 1 };
    const results = await dataApi.performFiles(data);
    throwIfPerformFilesError(data, results);

    if (getState().settings.doExtractContents) {
      const urls = selectedValues.map(value => value.content.url);
      axios.post(BRACE_PRE_EXTRACT_URL, { urls })
        .then(() => { })
        .catch((error) => {
          console.log('Error when contact Brace server to pre-extract contents with urls: ', urls, ' Error: ', error);
        });
    }

    progress.done += values.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const _combineListNameMap = (settings, content) => {
  if (!isObject(settings) || !Array.isArray(settings.listNameMap)) return;
  if (!isObject(content) || !Array.isArray(content.listNameMap)) return;

  settings.listNameMap = copyListNameObjs(settings.listNameMap);

  const excludedListNames = getAllListNames(settings.listNameMap);
  const objs = copyListNameObjsWithExactExclude(content.listNameMap, excludedListNames);
  settings.listNameMap.push(...objs);
};

const _combineTagNameMap = (settings, content) => {
  if (!isObject(settings) || !Array.isArray(settings.tagNameMap)) return;
  if (!isObject(content) || !Array.isArray(content.tagNameMap)) return;

  settings.tagNameMap = copyTagNameObjs(settings.tagNameMap);

  const excludedTagNames = settings.tagNameMap.map(tagNameObj => tagNameObj.tagName);
  const objs = copyTagNameObjs(content.tagNameMap, excludedTagNames);
  settings.tagNameMap.push(...objs);
};

const _parseBraceSettings = async (settingsFPaths, settingsEntries) => {
  const settingsParts = [];
  for (const entry of settingsEntries) {
    const { fpath } = extractFPath(entry.path);
    if (!fpath.endsWith(DOT_JSON)) continue;

    let dt = parseInt(fpath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10);
    if (!isNumber(dt)) dt = 0;

    const content = entry.data;
    if (!content) continue;

    const settings = { ...initialSettingsState };
    if ([true, false].includes(content.doExtractContents)) {
      settings.doExtractContents = content.doExtractContents;
    }
    if ([true, false].includes(content.doDeleteOldLinksInTrash)) {
      settings.doDeleteOldLinksInTrash = content.doDeleteOldLinksInTrash;
    }
    if ([true, false].includes(content.doDescendingOrder)) {
      settings.doDescendingOrder = content.doDescendingOrder;
    }
    if (isListNameObjsValid(content.listNameMap)) {
      settings.listNameMap = content.listNameMap;
    }
    if (isTagNameObjsValid(content.tagNameMap)) {
      settings.tagNameMap = content.tagNameMap;
    }
    if ([LAYOUT_CARD, LAYOUT_LIST].includes(content.layoutType)) {
      settings.layoutType = content.layoutType;
    }

    // For choosing the latest one.
    settingsParts.push({ dt, content: settings });
  }

  let latestDt, latestSettings;
  for (const settingsPart of settingsParts) {
    if (!isNumber(latestDt) || !isObject(latestSettings)) {
      [latestDt, latestSettings] = [settingsPart.dt, settingsPart.content];
      continue;
    }
    if (settingsPart.dt <= latestDt) continue;
    [latestDt, latestSettings] = [settingsPart.dt, settingsPart.content];
  }
  if (!isObject(latestSettings)) return;

  const lsfpsResult = getLastSettingsFPaths(settingsFPaths);
  if (lsfpsResult.fpaths.length > 0) {
    const { contents } = await dataApi.getFiles(lsfpsResult.fpaths, true);
    for (const content of contents) {
      if (isEqual(latestSettings, content)) return;

      _combineListNameMap(latestSettings, content);
      _combineTagNameMap(latestSettings, content);
    }
  }

  let now = Date.now();
  const fname = createDataFName(`${now}${randomString(4)}`, lsfpsResult.ids);
  const fpath = createSettingsFPath(fname);
  now += 1;

  const values = [
    { id: fpath, type: PUT_FILE, path: fpath, content: latestSettings },
  ];

  const data = { values, isSequential: false, nItemsForNs: 1 };
  const results = await dataApi.performFiles(data);
  throwIfPerformFilesError(data, results);

  vars.importAllData.doExtractContents = latestSettings.doExtractContents;
};

const parseBraceSettings = async (
  dispatch, settingsFPaths, settingsEntries, progress
) => {
  await _parseBraceSettings(settingsFPaths, settingsEntries);
  progress.done += settingsEntries.length;
  if (settingsEntries.length > 0) {
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseBraceImages = async (dispatch, existFPaths, imgEntries, progress) => {
  const nLinks = 10;
  for (let i = 0; i < imgEntries.length; i += nLinks) {
    const selectedEntries = imgEntries.slice(i, i + nLinks);

    const values = [];
    for (const entry of selectedEntries) {
      const { fpath, fpathParts, fnameParts } = extractFPath(entry.path);
      if (fpathParts.length !== 2 || fpathParts[0] !== IMAGES) continue;
      if (fnameParts.length !== 2) continue;

      if (existFPaths.includes(fpath)) continue;

      let content = entry.data;
      if (!isString(content) || !content.startsWith('data:')) continue;

      const k = content.indexOf(',');
      if (k === -1) continue;
      if (!content.slice(0, k).includes(BASE64)) continue;

      content = await convertDataUrlToBlob(content);

      await fileApi.putFile(fpath, content);

      values.push({ id: fpath, type: PUT_FILE, path: fpath, content });
    }

    const data = { values, isSequential: false, nItemsForNs: 1 };
    const results = await dataApi.performFiles(data);
    throwIfPerformFilesError(data, results);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseBraceLinks = async (
  dispatch, existMainIds, ssltInfos, linkEntries, ssltEntries, progress
) => {
  const psInfos = {};
  for (const entry of ssltEntries) {
    const { fpath, fpathParts, fnameParts } = extractFPath(entry.path);
    if (fpathParts.length !== 5 || fpathParts[0] !== SSLTS) continue;
    if (fnameParts.length !== 2) continue;

    const listName = fpathParts[1];
    if (listName.length === 0) continue;

    const updatedDT = fpathParts[2], addedDT = fpathParts[3], fname = fpathParts[4];
    if (!(/^\d+$/.test(updatedDT))) continue;
    if (!(/^\d+$/.test(addedDT))) continue;
    if (!fname.endsWith(DOT_JSON)) continue;

    const id = fname.slice(0, -5);
    const tokens = id.split('-');
    if (![3, 4].includes(tokens.length)) continue;
    if (!(/^\d+$/.test(tokens[0]))) continue;
    if (tokens.length === 4 && !(/^\d+$/.test(tokens[3]))) continue;

    const pdUpdatedDT = parseInt(updatedDT, 10);

    const mainId = getMainId(id);
    if (isObject(psInfos[mainId]) && psInfos[mainId].updatedDT > pdUpdatedDT) continue;

    const content = entry.data;
    if (!isEqual(content, {})) continue;

    psInfos[mainId] = { updatedDT: pdUpdatedDT, listName, fpath };
  }
  progress.done += ssltEntries.length;
  if (ssltEntries.length > 0) {
    dispatch(updateImportAllDataProgress(progress));
  }

  let now = Date.now();
  const nLinks = 30;
  for (let i = 0; i < linkEntries.length; i += nLinks) {
    const selectedEntries = linkEntries.slice(i, i + nLinks);

    const values = [], addingUrls = [];
    for (const entry of selectedEntries) {
      const { fpath, fpathParts, fname } = extractFPath(entry.path);
      if (fpathParts.length !== 3 || fpathParts[0] !== LINKS) continue;
      if (!fname.endsWith(DOT_JSON)) continue;

      let content = entry.data;
      if (!isObject(content)) continue;

      if (
        !('id' in content && 'url' in content && 'addedDT' in content)
      ) continue;

      if (!(isString(content.id) && isString(content.url))) continue;
      if (!isNumber(content.addedDT)) continue;

      const id = fname.slice(0, -5);
      if (id !== content.id) continue;

      const tokens = id.split('-');
      if (![3, 4].includes(tokens.length)) continue;
      if (!(/^\d+$/.test(tokens[0]))) continue;
      if (tokens.length === 4 && !(/^\d+$/.test(tokens[3]))) continue;

      const mainId = getMainId(id);
      if (existMainIds.includes(mainId)) continue;

      if (!isDecorValid(content)) {
        content.decor = randomDecor(getUrlFirstChar(content.url));
      }

      if ('extractedResult' in content) {
        if (!isExtractedResultValid(content)) {
          content = { ...content };
          delete content.extractedResult;
        }
      }

      if ('custom' in content) {
        if (!isCustomValid(content)) {
          content = { ...content };
          delete content.custom;
        }
      }

      values.push({ id: fpath, type: PUT_FILE, path: fpath, content });
      addingUrls.push(content.url);

      let listName = fpathParts[1];
      if (isObject(psInfos[mainId])) listName = psInfos[mainId].listName;

      let doPut = false;
      if (isObject(ssltInfos[mainId]) && isObject(psInfos[mainId])) {
        if (ssltInfos[mainId].listName !== listName) doPut = true;
      } else if (isObject(ssltInfos[mainId]) && !isObject(psInfos[mainId])) {
        if (ssltInfos[mainId].listName !== listName) doPut = true;
      } else if (!isObject(ssltInfos[mainId]) && isObject(psInfos[mainId])) {
        if (fpathParts[1] !== listName) doPut = true;
      }
      if (listName === TRASH) doPut = true;
      if (doPut) {
        const ssltFPath = createSsltFPath(listName, now, now, id);
        values.push({ id: ssltFPath, type: PUT_FILE, path: ssltFPath, content: {} });
        now += 1;
      }
    }

    const data = { values, isSequential: false, nItemsForNs: 1 };
    const results = await dataApi.performFiles(data);
    throwIfPerformFilesError(data, results);

    if (vars.importAllData.doExtractContents) {
      axios.post(BRACE_PRE_EXTRACT_URL, { urls: addingUrls })
        .then(() => { })
        .catch((error) => {
          console.log('Error when contact Brace server to pre-extract contents with urls: ', addingUrls, ' Error: ', error);
        });
    }

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseBracePins = async (dispatch, pins, pinEntries, progress) => {
  const nLinks = 40;
  for (let i = 0; i < pinEntries.length; i += nLinks) {
    const selectedEntries = pinEntries.slice(i, i + nLinks);

    const values = [];
    for (const entry of selectedEntries) {
      const { fpath, fpathParts, fnameParts } = extractFPath(entry.path);
      if (fpathParts.length !== 5 || fpathParts[0] !== PINS) continue;
      if (fnameParts.length !== 2) continue;

      const rank = fpathParts[1];
      if (rank.length === 0) continue;

      const updatedDT = fpathParts[2], addedDT = fpathParts[3], fname = fpathParts[4];
      if (!(/^\d+$/.test(updatedDT))) continue;
      if (!(/^\d+$/.test(addedDT))) continue;
      if (!fname.endsWith(DOT_JSON)) continue;

      const id = fname.slice(0, -5);
      const tokens = id.split('-');
      if (![3, 4].includes(tokens.length)) continue;
      if (!(/^\d+$/.test(tokens[0]))) continue;
      if (tokens.length === 4 && !(/^\d+$/.test(tokens[3]))) continue;

      if (getMainId(id) in pins) continue;

      const content = entry.data;
      if (!isEqual(content, {})) continue;

      values.push({ id: fpath, type: PUT_FILE, path: fpath, content });
    }

    const data = { values, isSequential: false, nItemsForNs: 1 };
    const results = await dataApi.performFiles(data);
    throwIfPerformFilesError(data, results);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseBraceTags = async (dispatch, tags, tagEntries, progress) => {
  const nLinks = 40;
  for (let i = 0; i < tagEntries.length; i += nLinks) {
    const selectedEntries = tagEntries.slice(i, i + nLinks);

    const values = [];
    for (const entry of selectedEntries) {
      const { fpath, fpathParts, fnameParts } = extractFPath(entry.path);
      if (fpathParts.length !== 6 || fpathParts[0] !== TAGS) continue;
      if (fnameParts.length !== 2) continue;

      const tagName = fpathParts[1], rank = fpathParts[2];
      if (tagName.length === 0) continue;
      if (rank.length === 0) continue;

      const updatedDT = fpathParts[3], addedDT = fpathParts[4], fname = fpathParts[5];
      if (!(/^\d+$/.test(updatedDT))) continue;
      if (!(/^\d+$/.test(addedDT))) continue;
      if (!fname.endsWith(DOT_JSON)) continue;

      const id = fname.slice(0, -5);
      const tokens = id.split('-');
      if (![3, 4].includes(tokens.length)) continue;
      if (!(/^\d+$/.test(tokens[0]))) continue;
      if (tokens.length === 4 && !(/^\d+$/.test(tokens[3]))) continue;

      const mainId = getMainId(id);
      if (
        isObject(tags[mainId]) &&
        tags[mainId].values.some(value => value.tagName === tagName)
      ) {
        continue;
      }

      const content = entry.data;
      if (!isEqual(content, {})) continue;

      values.push({ id: fpath, type: PUT_FILE, path: fpath, content });
    }

    const data = { values, isSequential: false, nItemsForNs: 1 };
    const results = await dataApi.performFiles(data);
    throwIfPerformFilesError(data, results);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseBraceImportedFile = async (dispatch, getState, json) => {
  const {
    linkFPaths, ssltFPaths, staticFPaths, settingsFPaths, pinFPaths, tagFPaths,
  } = await dataApi.listFPaths();

  const { linkMetas, ssltInfos } = listLinkMetas(linkFPaths, ssltFPaths, {});

  const existMainIds = [];
  for (const meta of linkMetas) {
    const { id } = meta;
    existMainIds.push(getMainId(id));
  }

  const pins = getPins(pinFPaths, {}, false);
  const tags = getTags(tagFPaths, {});

  const linkEntries = [], ssltEntries = [], pinEntries = [], tagEntries = [];
  const imgEntries = [], settingsEntries = [];
  if (Array.isArray(json)) {
    for (const obj of json) {
      if (!isObject(obj) || !isString(obj.path)) continue;

      if (obj.path.startsWith(LINKS)) {
        linkEntries.push(obj);
        continue;
      }
      if (obj.path.startsWith(SSLTS)) {
        ssltEntries.push(obj);
        continue;
      }
      if (obj.path.startsWith(PINS)) {
        pinEntries.push(obj);
        continue;
      }
      if (obj.path.startsWith(TAGS)) {
        tagEntries.push(obj);
        continue;
      }
      if (obj.path.startsWith(IMAGES)) {
        imgEntries.push(obj);
        continue;
      }
      if (obj.path.startsWith(SETTINGS)) {
        settingsEntries.push(obj);
        continue;
      }
    }
  }

  const total = (
    linkEntries.length + ssltEntries.length + pinEntries.length + tagEntries.length +
    imgEntries.length + settingsEntries.length
  );
  const progress = { total, done: 0 };
  dispatch(updateImportAllDataProgress(progress));

  if (progress.total === 0) return;

  vars.importAllData.doExtractContents = getState().settings.doExtractContents;

  await parseBraceSettings(dispatch, settingsFPaths, settingsEntries, progress);
  await parseBraceImages(dispatch, staticFPaths, imgEntries, progress);

  await parseBraceLinks(
    dispatch, existMainIds, ssltInfos, linkEntries, ssltEntries, progress
  );
  await parseBracePins(dispatch, pins, pinEntries, progress);
  await parseBraceTags(dispatch, tags, tagEntries, progress);
};

const parseImportedFile = async (dispatch, getState, text) => {
  dispatch(updateImportAllDataProgress({ total: 'calculating...', done: 0 }));

  try {
    let isRaw = false, json;
    try {
      json = JSON.parse(text);
    } catch (error) {
      isRaw = true;
    }

    if (isRaw) {
      await parseRawImportedFile(dispatch, getState, text);
    } else {
      await parseBraceImportedFile(dispatch, getState, json);
    }
  } catch (error) {
    dispatch(updateImportAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }
};

export const importAllData = () => async (dispatch, getState) => {
  const onError = () => {
    window.alert('Read failed: could not read the content in the file. Please recheck your file.');
  };

  const onReaderLoad = (e) => {
    parseImportedFile(dispatch, getState, e.target.result);
  };

  const onInputChange = () => {
    if (input.files) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = onReaderLoad;
      reader.onerror = onError;
      reader.readAsText(file);
    }
  };

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt, .htm, .html';
  input.addEventListener('change', onInputChange);
  input.click();
};

export const updateImportAllDataProgress = (progress) => {
  return {
    type: UPDATE_IMPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

const _canExport = (listName, lockSettings) => {
  // Possible e.g., force lock while settingsPopup is shown.
  let lockedList = lockSettings.lockedLists[MY_LIST];
  if (isObject(lockedList)) {
    if (!isNumber(lockedList.unlockedDT)) {
      if (!lockedList.canChangeListNames) {
        if (!lockedList.canExport) return false;
      }
    }
  }

  lockedList = lockSettings.lockedLists[listName];
  if (isObject(lockedList)) {
    if (!isNumber(lockedList.unlockedDT)) {
      if (!lockedList.canExport) return false;
    }
  }
  return true;
};

const _getStaticFiles = async (staticFPaths) => {
  const result = { responses: [] };

  const remainFPaths = [];
  for (const fpath of staticFPaths) {
    if (vars.platform.isReactNative) {
      remainFPaths.push('file://' + fpath);
      continue;
    }

    const { content } = await fileApi.getFile(fpath);
    if (content === undefined) {
      remainFPaths.push(fpath);
      continue;
    }

    result.responses.push({ content, fpath, success: true });
  }

  const { responses } = await dataApi.getFiles(remainFPaths, true);
  for (const response of responses) {
    result.responses.push(response);

    if (vars.platform.isReactNative) continue;
    if (response.success) {
      const { fpath, content } = response;
      await fileApi.putFile(fpath, content);
    }
  }

  return result;
};

export const exportAllData = () => async (dispatch, getState) => {
  dispatch(updateExportAllDataProgress({ total: 'calculating...', done: 0 }));

  const lockSettings = getState().lockSettings;

  let lfpRst;
  try {
    lfpRst = await dataApi.listFPaths();
  } catch (error) {
    dispatch(updateExportAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }

  const {
    linkMetas, ssltInfos,
  } = listLinkMetas(lfpRst.linkFPaths, lfpRst.ssltFPaths, {});

  const linkFPaths = [], ssltFPaths = [], pinFPaths = [], tagFPaths = [];
  const settingsFPaths = [], linkMainIds = [];

  for (const meta of linkMetas) {
    const { id, fpaths, listName } = meta;
    if (!_canExport(listName, lockSettings)) continue;

    for (const fpath of fpaths) {
      linkFPaths.push(fpath);
    }
    linkMainIds.push(getMainId(id));
  }

  for (const mainId in ssltInfos) {
    if (!linkMainIds.includes(mainId)) continue;

    const { fpath } = ssltInfos[mainId];
    ssltFPaths.push(fpath);
  }

  for (const pinFPath of lfpRst.pinFPaths) {
    const { id } = extractPinFPath(pinFPath);
    const pinMainId = getMainId(id);
    if (!linkMainIds.includes(pinMainId)) continue;
    pinFPaths.push(pinFPath);
  }

  for (const tagFPath of lfpRst.tagFPaths) {
    const { id } = extractTagFPath(tagFPath);
    const tagMainId = getMainId(id);
    if (!linkMainIds.includes(tagMainId)) continue;
    tagFPaths.push(tagFPath);
  }

  const lsfpsResult = getLastSettingsFPaths(lfpRst.settingsFPaths);
  if (lsfpsResult.fpaths.length > 0) {
    const lastSettingsFPath = lsfpsResult.fpaths[0];
    const { contents } = await dataApi.getFiles([lastSettingsFPath], true);
    if (!isEqual(initialSettingsState, contents[0])) {
      settingsFPaths.push(lastSettingsFPath);
    }
  }

  const total = (
    linkFPaths.length + ssltFPaths.length + pinFPaths.length + tagFPaths.length +
    settingsFPaths.length
  );
  const progress = { total, done: 0 };
  dispatch(updateExportAllDataProgress(progress));

  if (progress.total === 0) return;

  try {
    let nLinks = 1;
    if (getState().user.hubUrl === SD_HUB_URL) nLinks = 10;

    const successResponses = [], errorResponses = [];
    for (let i = 0; i < linkFPaths.length; i += nLinks) {
      const staticFPaths = [];

      const selectedFPaths = linkFPaths.slice(i, i + nLinks);
      const { responses } = await dataApi.getFiles(selectedFPaths, true);
      for (const response of responses) {
        if (response.success) {
          const path = response.fpath, data = response.content;
          successResponses.push({ path, data });

          if (isObject(data.custom)) {
            const { image } = data.custom;
            if (isString(image) && image.startsWith(CD_ROOT + '/')) {
              const staticFPath = getStaticFPath(image);
              if (!staticFPaths.includes(staticFPath)) staticFPaths.push(staticFPath);
            }
          }
        } else {
          errorResponses.push(response);
        }
      }

      const { responses: sResponses } = await _getStaticFiles(staticFPaths);
      for (const response of sResponses) {
        if (response.success) {
          let path = response.fpath, data = response.content;
          if (path.startsWith('file://')) {
            path = path.slice('file://'.length);

            //const srcFPath = `${Dirs.DocumentDir}/${path}`;
            //const doExist = await FileSystem.exists(srcFPath);
            //if (!doExist) continue;
            //data = await FileSystem.readFile(srcFPath, BASE64);

            data = `data:application/octet-stream;base64,${data}`;
          } else {
            if (isUint8Array(data)) data = new Blob([data]);
            if (isBlob(data)) data = await convertBlobToDataUrl(data);
          }
          successResponses.push({ path, data });
        } else {
          errorResponses.push(response);
        }
      }

      progress.done += selectedFPaths.length;
      if (progress.done < progress.total) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }

    const sptFPaths = [...ssltFPaths, ...pinFPaths, ...tagFPaths];
    for (const fpath of sptFPaths) {
      const path = fpath, data = {};
      successResponses.push({ path, data });
    }
    progress.done += sptFPaths.length;
    if (progress.done < progress.total) {
      dispatch(updateExportAllDataProgress(progress));
    }

    for (let i = 0; i < settingsFPaths.length; i += nLinks) {
      const selectedFPaths = settingsFPaths.slice(i, i + nLinks);
      const { responses } = await dataApi.getFiles(selectedFPaths, true);
      for (const response of responses) {
        if (response.success) {
          const path = response.fpath, data = response.content;
          successResponses.push({ path, data });
        } else {
          errorResponses.push(response);
        }
      }

      progress.done += selectedFPaths.length;
      if (progress.done < progress.total) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }

    const fileName = `Brace.to data ${getFormattedTimeStamp(new Date())}.txt`;
    const blob = new Blob(
      [JSON.stringify(successResponses, null, 2)], { type: 'text/plain;charset=utf-8' }
    );
    saveAs(blob, fileName);

    if (errorResponses.length > 0) {
      progress.total = -1;
      progress.done = -1;
      progress.error = 'Some download requests failed. Data might be missing in the exported file.';
    }
    dispatch(updateExportAllDataProgress(progress));
  } catch (error) {
    dispatch(updateExportAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }
};

export const updateExportAllDataProgress = (progress) => {
  return {
    type: UPDATE_EXPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

export const deleteAllData = () => async (dispatch, getState) => {
  dispatch(updateDeleteAllDataProgress({ total: 'calculating...', done: 0 }));

  // redux-offline: Empty outbox
  dispatch({ type: OFFLINE_RESET_STATE });

  let lfpRst;
  try {
    lfpRst = await dataApi.listFPaths();
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }

  const { prevFPathsPerMids } = listLinkMetas(lfpRst.linkFPaths, lfpRst.ssltFPaths, {});

  const prevFPaths = [], fpaths = [];
  for (const mainId in prevFPathsPerMids) {
    for (const fpath of prevFPathsPerMids[mainId]) prevFPaths.push(fpath);
  }
  for (const listName in lfpRst.linkFPaths) {
    for (const fpath of lfpRst.linkFPaths[listName]) {
      if (prevFPaths.includes(fpath)) continue;
      fpaths.push(fpath);
    }
  }

  const { fpaths: lastSettingsFPaths } = getLastSettingsFPaths(lfpRst.settingsFPaths);
  for (const fpath of lfpRst.settingsFPaths) {
    if (lastSettingsFPaths.includes(fpath)) continue;
    prevFPaths.push(fpath);
  }
  fpaths.push(...lastSettingsFPaths);

  if (isString(lfpRst.infoFPath)) fpaths.push(lfpRst.infoFPath);
  fpaths.push(...lfpRst.staticFPaths);
  fpaths.push(...lfpRst.ssltFPaths);
  fpaths.push(...lfpRst.pinFPaths);
  fpaths.push(...lfpRst.tagFPaths);

  const progress = { total: prevFPaths.length + fpaths.length, done: 0 };
  dispatch(updateDeleteAllDataProgress(progress));

  if (progress.total === 0) return;

  try {
    const nLinks = 60;
    for (let i = 0; i < prevFPaths.length; i += nLinks) {
      const selectedFPaths = prevFPaths.slice(i, i + nLinks);

      const values = [];
      for (const fpath of selectedFPaths) {
        values.push(
          { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
        );
      }

      const data = { values, isSequential: false, nItemsForNs: 1 };
      const results = await dataApi.performFiles(data);
      throwIfPerformFilesError(data, results);

      progress.done += selectedFPaths.length;
      dispatch(updateDeleteAllDataProgress(progress));
    }
    for (let i = 0; i < fpaths.length; i += nLinks) {
      const selectedFPaths = fpaths.slice(i, i + nLinks);

      const values = [];
      for (const fpath of selectedFPaths) {
        values.push(
          { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
        );
      }

      const data = { values, isSequential: false, nItemsForNs: 1 };
      const results = await dataApi.performFiles(data);
      throwIfPerformFilesError(data, results);

      progress.done += selectedFPaths.length;
      dispatch(updateDeleteAllDataProgress(progress));
    }
    await cacheApi.deleteAllFiles();
    await fileApi.deleteAllFiles();

    dispatch({ type: DELETE_ALL_DATA });
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }
};

export const updateDeleteAllDataProgress = (progress) => {
  return {
    type: UPDATE_DELETE_ALL_DATA_PROGRESS,
    payload: progress,
  };
};
