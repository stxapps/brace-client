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
  MY_LIST, TRASH, ARCHIVE, N_LINKS, LINKS, IMAGES, SETTINGS, INFO, PINS, DOT_JSON,
  BASE64,
} from '../types/const';
import {
  isEqual, isString, isObject, isNumber, sleep, randomString, getUrlFirstChar,
  randomDecor, isDecorValid, isExtractedResultValid, isCustomValid, isListNameObjsValid,
  createDataFName, createLinkFPath, createSettingsFPath, getSettingsFPaths,
  getLastSettingsFPaths, batchGetFileWithRetry,
} from '../utils';
import {
  isUint8Array, isBlob, convertBlobToDataUrl, convertDataUrlToBlob,
} from '../utils/index-web';
import { initialSettingsState } from '../types/initialStates';
import vars from '../vars';

const importAllDataLoop = async (dispatch, fpaths, contents) => {
  let total = fpaths.length, doneCount = 0;
  dispatch(updateImportAllDataProgress({ total, done: doneCount }));

  try {
    for (let i = 0; i < fpaths.length; i += 1) {
      // One at a time to not overwhelm the server
      const selectedFPaths = fpaths.slice(i, i + 1);
      const selectedContents = contents.slice(i, i + 1);
      await serverApi.putFiles(selectedFPaths, selectedContents);

      doneCount += selectedFPaths.length;
      dispatch(updateImportAllDataProgress({ total, done: doneCount }));

      await sleep(300);
    }
  } catch (error) {
    dispatch(updateImportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));

    if (doneCount < total) {
      let msg = 'There is an error while importing! Below are contents that have not been imported:\n';
      for (let i = doneCount; i < fpaths.length; i++) {
        const fpath = fpaths[i];
        const [fname] = fpath.split('/').slice(-1);
        if (fpath.startsWith(LINKS)) {
          msg += '    • ' + contents[i].url + '\n';
        }
        if (fpath.startsWith(IMAGES)) {
          msg += '    • Image of ' + fname + '\n';
        }
        if (fpath.startsWith(PINS)) {
          msg += '    • Pin on ' + fname + '\n';
        }
        if (fpath.startsWith(SETTINGS)) {
          msg += '    • Settings\n';
        }
      }
      window.alert(msg);
    }
  }
};

const parseImportedFile = async (dispatch, settingsParentIds, text) => {

  dispatch(updateImportAllDataProgress({ total: 'calculating...', done: 0 }));

  // 3 formats: json, html, and plain text
  const fpaths = [], contents = [], settingsParts = [];
  try {
    const json = JSON.parse(text);
    if (Array.isArray(json)) {
      for (const obj of json) {
        if (
          !obj.path ||
          !isString(obj.path) ||
          !(
            obj.path.startsWith(LINKS) ||
            obj.path.startsWith(IMAGES) ||
            obj.path.startsWith(PINS) ||
            obj.path.startsWith(SETTINGS)
          )
        ) continue;

        if (!obj.data) continue;
        if (obj.path.startsWith(IMAGES)) {
          if (!isString(obj.data)) continue;
        } else {
          if (!isObject(obj.data)) continue;
        }

        if (obj.path.startsWith(LINKS)) {
          if (
            !('id' in obj.data && 'url' in obj.data && 'addedDT' in obj.data)
          ) continue;

          if (!(isString(obj.data.id) && isString(obj.data.url))) continue;
          if (!isNumber(obj.data.addedDT)) continue;

          const arr = obj.path.split('/');
          if (arr.length !== 3) continue;
          if (arr[0] !== LINKS) continue;

          const listName = arr[1], fname = arr[2];
          if (!fname.endsWith(DOT_JSON)) continue;

          const id = fname.slice(0, -5);
          if (id !== obj.data.id) continue;

          const tokens = id.split('-');
          if (listName === TRASH) {
            if (tokens.length !== 4) continue;
            if (!(/^\d+$/.test(tokens[0]) && /^\d+$/.test(tokens[3]))) continue;
          } else {
            if (tokens.length !== 3) continue;
            if (!(/^\d+$/.test(tokens[0]))) continue;
          }

          if (!isDecorValid(obj.data)) {
            obj.data.decor = randomDecor(getUrlFirstChar(obj.data.url));
          }

          if ('extractedResult' in obj.data) {
            if (!isExtractedResultValid(obj.data)) {
              obj.data = { ...obj.data };
              delete obj.data.extractedResult;
            }
          }

          if ('custom' in obj.data) {
            if (!isCustomValid(obj.data)) {
              obj.data = { ...obj.data };
              delete obj.data.custom;
            }
          }
        }

        if (obj.path.startsWith(IMAGES)) {
          const arr = obj.path.split('/');
          if (arr.length !== 2) continue;

          if (!obj.data.startsWith('data:')) continue;

          const i = obj.data.indexOf(',');
          if (i === -1) continue;
          if (!obj.data.slice(0, i).includes(BASE64)) continue;

          obj.data = await convertDataUrlToBlob(obj.data);
        }

        if (obj.path.startsWith(PINS)) {
          const arr = obj.path.split('/');
          if (arr.length !== 5) continue;
          if (arr[0] !== PINS) continue;

          const updatedDT = arr[2], addedDT = arr[3], fname = arr[4];
          if (!(/^\d+$/.test(updatedDT))) continue;
          if (!(/^\d+$/.test(addedDT))) continue;
          if (!fname.endsWith(DOT_JSON)) continue;

          const id = fname.slice(0, -5);
          const tokens = id.split('-');
          if (tokens.length !== 3) continue;
          if (!(/^\d+$/.test(tokens[0]))) continue;
        }

        if (obj.path.startsWith(SETTINGS)) {
          if (!obj.path.endsWith(DOT_JSON)) continue;

          let dt = parseInt(obj.path.slice(SETTINGS.length, -1 * DOT_JSON.length), 10);
          if (!isNumber(dt)) dt = 0;

          const settings = { ...initialSettingsState };
          if ([true, false].includes(obj.data.doExtractContents)) {
            settings.doExtractContents = obj.data.doExtractContents;
          }
          if ([true, false].includes(obj.data.doDeleteOldLinksInTrash)) {
            settings.doDeleteOldLinksInTrash = obj.data.doDeleteOldLinksInTrash;
          }
          if ([true, false].includes(obj.data.doDescendingOrder)) {
            settings.doDescendingOrder = obj.data.doDescendingOrder;
          }
          if ('listNameMap' in obj.data && isListNameObjsValid(obj.data.listNameMap)) {
            settings.listNameMap = obj.data.listNameMap;
          }

          settingsParts.push({ dt, content: settings });
          continue;
        }

        fpaths.push(obj.path);
        contents.push(obj.data);
      }
    }
  } catch (error) {
    console.log('parseImportedFile: JSON.parse error: ', error);

    let listName = MY_LIST;
    let now = Date.now();

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
  }

  let latestSettingsPart;
  for (const settingsPart of settingsParts) {
    if (!isObject(latestSettingsPart)) {
      latestSettingsPart = settingsPart;
      continue;
    }
    if (latestSettingsPart.dt < settingsPart.dt) latestSettingsPart = settingsPart;
  }
  if (isObject(latestSettingsPart)) {
    const addedDT = Date.now();
    const fname = createDataFName(`${addedDT}${randomString(4)}`, settingsParentIds);
    fpaths.push(createSettingsFPath(fname));
    contents.push(latestSettingsPart.content);
  }

  await importAllDataLoop(dispatch, fpaths, contents);
};

export const importAllData = () => async (dispatch, getState) => {
  const settingsFPaths = getSettingsFPaths(getState());
  const { ids: settingsParentIds } = getLastSettingsFPaths(settingsFPaths);

  const onError = () => {
    window.alert('Read failed: could not read content in the file. Please recheck your file.');
  };

  const onReaderLoad = (e) => {
    parseImportedFile(dispatch, settingsParentIds, e.target.result);
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
  input.accept = '.txt, .html, .json';
  input.addEventListener('change', onInputChange);
  input.click();
};

export const updateImportAllDataProgress = (progress) => {
  return {
    type: UPDATE_IMPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

const exportAllDataLoop = async (dispatch, fpaths, total, doneCount) => {
  const successData = [], errorData = [];
  for (let i = 0; i < fpaths.length; i += N_LINKS) {
    const selectedFPaths = fpaths.slice(i, i + N_LINKS);
    const responses = await batchGetFileWithRetry(
      serverApi.getFile, selectedFPaths, 0, true
    );
    for (const response of responses) {
      if (response.success) {
        successData.push({ path: response.fpath, data: response.content });
      } else {
        errorData.push(response);
      }
    }

    doneCount += selectedFPaths.length;
    if (doneCount < total || errorData.length === 0) {
      dispatch(updateExportAllDataProgress({ total, done: doneCount }));
    }
  }

  return { successData, errorData };
};

export const exportAllData = () => async (dispatch, getState) => {
  let doneCount = 0;
  dispatch(updateExportAllDataProgress({ total: 'calculating...', done: doneCount }));

  const fpaths = [], settingsFPaths = [];
  try {
    await serverApi.listFiles((fpath) => {
      if (vars.platform.isReactNative && fpath.startsWith(IMAGES)) {
        fpaths.push('file://' + fpath);
        return true;
      }

      if (fpath.startsWith(SETTINGS)) settingsFPaths.push(fpath);
      else if (fpath.startsWith(INFO)) return true;
      else fpaths.push(fpath);
      return true;
    });
  } catch (error) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }

  const lastSettingsFPaths = getLastSettingsFPaths(settingsFPaths);
  if (lastSettingsFPaths.fpaths.length > 0) {
    const lastSettingsFPath = lastSettingsFPaths.fpaths[0];
    const { contents } = await serverApi.getFiles([lastSettingsFPath], true);
    if (!isEqual(initialSettingsState, contents[0])) {
      fpaths.push(lastSettingsFPath);
    }
  }

  const total = fpaths.length;
  dispatch(updateExportAllDataProgress({ total, done: doneCount }));

  if (total === 0) return;

  try {
    const {
      successData, errorData,
    } = await exportAllDataLoop(dispatch, fpaths, total, doneCount);

    for (const item of successData) {
      if (isUint8Array(item.data)) item.data = new Blob([item.data]);
      if (isBlob(item.data)) {
        item.data = await convertBlobToDataUrl(item.data);
      }
    }

    var blob = new Blob(
      [JSON.stringify(successData)], { type: 'text/plain;charset=utf-8' }
    );
    saveAs(blob, 'brace-data.txt');

    if (errorData.length > 0) {
      dispatch(updateExportAllDataProgress({
        total: -1,
        done: -1,
        error: 'Some download requests failed. Data might be missing in the exported file.',
      }));
    }
  } catch (error) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }
};

export const updateExportAllDataProgress = (progress) => {
  return {
    type: UPDATE_EXPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

const deleteAllDataLoop = async (dispatch, fpaths, total, doneCount) => {

  if (fpaths.length === 0) throw new Error(`Invalid fpaths: ${fpaths}`);

  const selectedCount = Math.min(fpaths.length - doneCount, N_LINKS);
  const selectedFPaths = fpaths.slice(doneCount, doneCount + selectedCount);
  await serverApi.deleteFiles(selectedFPaths);

  doneCount = doneCount + selectedCount;
  if (doneCount > fpaths.length) {
    throw new Error(`Invalid doneCount: ${doneCount}, total: ${fpaths.length}`);
  }

  dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));

  if (doneCount < fpaths.length) {
    await deleteAllDataLoop(dispatch, fpaths, total, doneCount);
  }
};

export const deleteAllData = () => async (dispatch, getState) => {
  let doneCount = 0;
  dispatch(updateDeleteAllDataProgress({ total: 'calculating...', done: doneCount }));

  // redux-offline: Empty outbox
  dispatch({ type: OFFLINE_RESET_STATE });

  let fpaths = [], settingsFPaths = [], settingsIds;
  try {
    await serverApi.listFiles((fpath) => {
      if (fpath.startsWith(SETTINGS)) settingsFPaths.push(fpath);
      else fpaths.push(fpath);
      return true;
    });
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }

  const lastSettingsFPaths = getLastSettingsFPaths(settingsFPaths);
  [settingsFPaths, settingsIds] = [lastSettingsFPaths.fpaths, lastSettingsFPaths.ids];
  if (settingsFPaths.length === 1) {
    const { contents } = await serverApi.getFiles(settingsFPaths, true);
    if (isEqual(initialSettingsState, contents[0])) {
      [settingsFPaths, settingsIds] = [[], []];
    }
  }

  const total = fpaths.length + settingsFPaths.length;
  dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));

  if (total === 0) return;

  try {
    if (fpaths.length > 0) {
      await deleteAllDataLoop(dispatch, fpaths, total, doneCount);

      doneCount += fpaths.length;
      dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));
    }
    if (settingsFPaths.length > 0) {
      const addedDT = Date.now();
      const fname = createDataFName(`${addedDT}${randomString(4)}`, settingsIds);
      const newSettingsFPath = createSettingsFPath(fname);

      await serverApi.putFiles([newSettingsFPath], [{ ...initialSettingsState }]);
      try {
        await serverApi.putFiles(settingsFPaths, settingsFPaths.map(() => ({})));
      } catch (error) {
        console.log('deleteAllData error: ', error);
        // error in this step should be fine
      }

      doneCount += settingsFPaths.length;
      dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));
    }
    await fileApi.deleteAllFiles();

    dispatch({ type: DELETE_ALL_DATA });
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }
};

export const updateDeleteAllDataProgress = (progress) => {
  return {
    type: UPDATE_DELETE_ALL_DATA_PROGRESS,
    payload: progress,
  };
};
