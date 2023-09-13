import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
import { saveAs } from 'file-saver';

import serverApi from '../apis/server';
import fileApi from '../apis/localFile';
import {
  UPDATE_IMPORT_ALL_DATA_PROGRESS, UPDATE_EXPORT_ALL_DATA_PROGRESS,
  UPDATE_DELETE_ALL_DATA_PROGRESS, DELETE_ALL_DATA,
} from '../types/actionTypes';
import {
  MY_LIST, TRASH, ARCHIVE, N_LINKS, LINKS, IMAGES, SETTINGS, PINS, DOT_JSON, BASE64,
  LAYOUT_CARD, LAYOUT_LIST, CD_ROOT,
} from '../types/const';
import {
  isEqual, isString, isObject, isNumber, sleep, randomString, getUrlFirstChar,
  randomDecor, isDecorValid, isExtractedResultValid, isCustomValid, isListNameObjsValid,
  createDataFName, createLinkFPath, createSettingsFPath, getLastSettingsFPaths,
  batchGetFileWithRetry, extractFPath, getPins, getMainId, getFormattedTimeStamp,
  extractLinkFPath, extractPinFPath, getStaticFPath,
} from '../utils';
import {
  isUint8Array, isBlob, convertBlobToDataUrl, convertDataUrlToBlob,
} from '../utils/index-web';
import { initialSettingsState } from '../types/initialStates';
import vars from '../vars';

const importAllDataLoop = async (fpaths, contents) => {
  // One at a time to not overwhelm the server
  const nLinks = 1;
  for (let i = 0; i < fpaths.length; i += nLinks) {
    const _fpaths = fpaths.slice(i, i + nLinks);
    const _contents = contents.slice(i, i + nLinks);
    await serverApi.putFiles(_fpaths, _contents);

    await sleep(300);
  }
};

const parseRawImportedFile = async (dispatch, getState, text) => {

  let listName = MY_LIST, now = Date.now();
  const fpaths = [], contents = [];
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

        fpaths.push(fpath);
        contents.push(link);
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

      fpaths.push(fpath);
      contents.push(link);
      now += 1;
    }
  }

  const progress = { total: fpaths.length, done: 0 };
  dispatch(updateImportAllDataProgress(progress));

  if (progress.total === 0) return;

  for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
    const _fpaths = fpaths.slice(i, i + N_LINKS);
    const _contents = contents.slice(i, i + N_LINKS);

    await importAllDataLoop(_fpaths, _contents);

    progress.done += _fpaths.length;
    dispatch(updateImportAllDataProgress(progress));
  }
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
    if ('listNameMap' in content && isListNameObjsValid(content.listNameMap)) {
      settings.listNameMap = content.listNameMap;
    }
    if ([LAYOUT_CARD, LAYOUT_LIST].includes(content.layoutType)) {
      settings.layoutType = content.layoutType;
    }

    // For choosing the latest one.
    settingsParts.push({ dt, content: settings });
  }

  let latestSettingsPart;
  for (const settingsPart of settingsParts) {
    if (!isObject(latestSettingsPart)) {
      latestSettingsPart = settingsPart;
      continue;
    }
    if (latestSettingsPart.dt < settingsPart.dt) latestSettingsPart = settingsPart;
  }
  if (!isObject(latestSettingsPart)) return;

  const lastSettingsFPaths = getLastSettingsFPaths(settingsFPaths);
  if (lastSettingsFPaths.fpaths.length > 0) {
    const lastSettingsFPath = lastSettingsFPaths.fpaths[0];
    const { contents } = await serverApi.getFiles([lastSettingsFPath], true);
    if (isEqual(latestSettingsPart.content, contents[0])) {
      return;
    }
  }

  let now = Date.now();
  const fname = createDataFName(`${now}${randomString(4)}`, lastSettingsFPaths.ids);
  const fpath = createSettingsFPath(fname);
  now += 1;

  await importAllDataLoop([fpath], [latestSettingsPart.content]);
};

const parseBraceSettings = async (
  dispatch, settingsFPaths, settingsEntries, progress
) => {
  await _parseBraceSettings(settingsFPaths, settingsEntries);
  progress.done += settingsEntries.length;
  dispatch(updateImportAllDataProgress(progress));
};

const parseBraceImages = async (dispatch, existFPaths, imgEntries, progress) => {
  for (let i = 0, j = imgEntries.length; i < j; i += N_LINKS) {
    const selectedEntries = imgEntries.slice(i, i + N_LINKS);

    const fpaths = [], contents = [];
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

      fpaths.push(fpath);
      contents.push(content);
    }

    await importAllDataLoop(fpaths, contents);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseBraceLinks = async (dispatch, existFPaths, linkEntries, progress) => {
  for (let i = 0, j = linkEntries.length; i < j; i += N_LINKS) {
    const selectedEntries = linkEntries.slice(i, i + N_LINKS);

    const fpaths = [], contents = [];
    for (const entry of selectedEntries) {
      const { fpath, fpathParts, fname } = extractFPath(entry.path);
      if (fpathParts.length !== 3 || fpathParts[0] !== LINKS) continue;
      if (!fname.endsWith(DOT_JSON)) continue;

      if (existFPaths.includes(fpath)) continue;

      let content = entry.data;
      if (!isObject(content)) continue;

      if (
        !('id' in content && 'url' in content && 'addedDT' in content)
      ) continue;

      if (!(isString(content.id) && isString(content.url))) continue;
      if (!isNumber(content.addedDT)) continue;

      const id = fname.slice(0, -5);
      if (id !== content.id) continue;

      const listName = fpathParts[1];
      const tokens = id.split('-');
      if (listName === TRASH) {
        if (tokens.length !== 4) continue;
        if (!(/^\d+$/.test(tokens[0]) && /^\d+$/.test(tokens[3]))) continue;
      } else {
        if (tokens.length !== 3) continue;
        if (!(/^\d+$/.test(tokens[0]))) continue;
      }

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

      fpaths.push(fpath);
      contents.push(content);
    }

    await importAllDataLoop(fpaths, contents);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseBracePins = async (dispatch, pins, pinEntries, progress) => {
  for (let i = 0, j = pinEntries.length; i < j; i += N_LINKS) {
    const selectedEntries = pinEntries.slice(i, i + N_LINKS);

    const fpaths = [], contents = [];
    for (const entry of selectedEntries) {
      const { fpathParts, fnameParts } = extractFPath(entry.path);
      if (fpathParts.length !== 5 || fpathParts[0] !== PINS) continue;
      if (fnameParts.length !== 2) continue;

      const updatedDT = fpathParts[2], addedDT = fpathParts[3], fname = fpathParts[4];
      if (!(/^\d+$/.test(updatedDT))) continue;
      if (!(/^\d+$/.test(addedDT))) continue;
      if (!fname.endsWith(DOT_JSON)) continue;

      const id = fname.slice(0, -5);
      const tokens = id.split('-');
      if (tokens.length !== 3) continue;
      if (!(/^\d+$/.test(tokens[0]))) continue;

      if (getMainId(id) in pins) continue;

      const content = entry.data;
      if (!isEqual(content, {})) continue;

      fpaths.push(fpathParts.join('/'));
      contents.push(content);
    }

    await importAllDataLoop(fpaths, contents);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseBraceImportedFile = async (dispatch, getState, json) => {

  const existFPaths = [], settingsFPaths = [], pinFPaths = [];
  await serverApi.listFiles((fpath) => {
    if (fpath.startsWith(SETTINGS)) settingsFPaths.push(fpath);
    else if (fpath.startsWith(PINS)) pinFPaths.push(fpath);

    existFPaths.push(fpath);
    return true;
  });

  const pins = getPins(pinFPaths, {}, false);

  const linkEntries = [], pinEntries = [], imgEntries = [], settingsEntries = [];
  if (Array.isArray(json)) {
    for (const obj of json) {
      if (!isObject(obj) || !isString(obj.path)) continue;

      if (obj.path.startsWith(LINKS)) {
        linkEntries.push(obj);
        continue;
      }
      if (obj.path.startsWith(PINS)) {
        pinEntries.push(obj);
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
    linkEntries.length + pinEntries.length + imgEntries.length + settingsEntries.length
  );
  const progress = { total, done: 0 };
  dispatch(updateImportAllDataProgress(progress));

  if (progress.total === 0) return;

  await parseBraceSettings(dispatch, settingsFPaths, settingsEntries, progress);
  await parseBraceImages(dispatch, existFPaths, imgEntries, progress);

  await parseBraceLinks(dispatch, existFPaths, linkEntries, progress);
  await parseBracePins(dispatch, pins, pinEntries, progress);
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

export const exportAllData = () => async (dispatch, getState) => {
  dispatch(updateExportAllDataProgress({ total: 'calculating...', done: 0 }));

  const lockSettings = getState().lockSettings;

  const _linkFPaths = [], _pinFPaths = [], _settingsFPaths = [];
  try {
    await serverApi.listFiles((fpath) => {
      if (fpath.startsWith(LINKS)) _linkFPaths.push(fpath);
      else if (fpath.startsWith(PINS)) _pinFPaths.push(fpath);
      else if (fpath.startsWith(SETTINGS)) _settingsFPaths.push(fpath);
      return true;
    });
  } catch (error) {
    dispatch(updateExportAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }

  const linkFPaths = [], pinFPaths = [], settingsFPaths = [], linkMainIds = [];

  for (const linkFPath of _linkFPaths) {
    const { listName, id } = extractLinkFPath(linkFPath);
    if (!_canExport(listName, lockSettings)) continue;
    linkFPaths.push(linkFPath);
    linkMainIds.push(getMainId(id));
  }

  for (const pinFPath of _pinFPaths) {
    const { id } = extractPinFPath(pinFPath);
    const pinMainId = getMainId(id);
    if (!linkMainIds.includes(pinMainId)) continue;
    pinFPaths.push(pinFPath);
  }

  const lastSettingsFPaths = getLastSettingsFPaths(_settingsFPaths);
  if (lastSettingsFPaths.fpaths.length > 0) {
    const lastSettingsFPath = lastSettingsFPaths.fpaths[0];
    const { contents } = await serverApi.getFiles([lastSettingsFPath], true);
    if (!isEqual(initialSettingsState, contents[0])) {
      settingsFPaths.push(lastSettingsFPath);
    }
  }

  const progress = {
    total: linkFPaths.length + pinFPaths.length + settingsFPaths.length, done: 0,
  };
  dispatch(updateExportAllDataProgress(progress));

  if (progress.total === 0) return;

  try {
    const successResponses = [], errorResponses = [];
    for (let i = 0; i < linkFPaths.length; i += N_LINKS) {
      const fileFPaths = [];

      const selectedFPaths = linkFPaths.slice(i, i + N_LINKS);
      const responses = await batchGetFileWithRetry(
        serverApi.getFile, selectedFPaths, 0, true
      );
      for (const response of responses) {
        if (response.success) {
          const path = response.fpath, data = response.content;
          successResponses.push({ path, data });

          if (isObject(data.custom)) {
            const { image } = data.custom;
            if (isString(image) && image.startsWith(CD_ROOT + '/')) {
              let fileFPath = getStaticFPath(image);
              if (vars.platform.isReactNative) fileFPath = 'file://' + fileFPath;
              if (!fileFPaths.includes(fileFPath)) fileFPaths.push(fileFPath);
            }
          }
        } else {
          errorResponses.push(response);
        }
      }

      const fileResponses = await batchGetFileWithRetry(
        serverApi.getFile, fileFPaths, 0, true
      );
      for (const response of fileResponses) {
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

    for (let i = 0; i < pinFPaths.length; i += N_LINKS) {
      const selectedFPaths = pinFPaths.slice(i, i + N_LINKS);
      for (const fpath of selectedFPaths) {
        const path = fpath, data = {};
        successResponses.push({ path, data });
      }

      progress.done += selectedFPaths.length;
      if (progress.done < progress.total) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }

    for (let i = 0; i < settingsFPaths.length; i += N_LINKS) {
      const selectedFPaths = settingsFPaths.slice(i, i + N_LINKS);
      const responses = await batchGetFileWithRetry(
        serverApi.getFile, selectedFPaths, 0, true
      );
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

  const fpaths = [];
  try {
    await serverApi.listFiles((fpath) => {
      fpaths.push(fpath);
      return true;
    });
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }

  const total = fpaths.length;
  const progress = { total, done: 0 };
  dispatch(updateDeleteAllDataProgress(progress));

  if (progress.total === 0) return;

  try {
    for (let i = 0, j = fpaths.length; i < j; i += N_LINKS) {
      const selectedFPaths = fpaths.slice(i, i + N_LINKS);
      await serverApi.deleteFiles(selectedFPaths);

      progress.done += selectedFPaths.length;
      dispatch(updateDeleteAllDataProgress(progress));
    }
    await fileApi.deleteAllFiles();

    vars.fetch.fetchedLnOrQts = [MY_LIST];
    vars.fetch.fetchedLinkMainIds = [];
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
