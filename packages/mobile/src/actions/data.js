import { Platform, Alert, PermissionsAndroid } from 'react-native';
import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
import { FileSystem, Dirs, Util } from 'react-native-file-access';
import DocumentPicker, {
  types as DocumentPickerTypes,
} from 'react-native-document-picker';
import Share from 'react-native-share';

import dataApi from '../apis/blockstack';
import cacheApi from '../apis/localCache';
import fileApi from '../apis/localFile';
import {
  UPDATE_IMPORT_ALL_DATA_PROGRESS, UPDATE_EXPORT_ALL_DATA_PROGRESS,
  UPDATE_DELETE_ALL_DATA_PROGRESS, DELETE_ALL_DATA,
} from '../types/actionTypes';
import {
  MY_LIST, TRASH, ARCHIVE, N_LINKS, LINKS, IMAGES, SETTINGS, PINS, TAGS, DOT_JSON,
  BASE64, LAYOUT_CARD, LAYOUT_LIST, CD_ROOT, UTF8,
} from '../types/const';
import {
  isEqual, isString, isObject, isNumber, sleep, randomString, getUrlFirstChar,
  randomDecor, isDecorValid, isExtractedResultValid, isCustomValid, isListNameObjsValid,
  isTagNameObjsValid, createDataFName, createLinkFPath, createSettingsFPath,
  getLastSettingsFPaths, extractFPath, getPins, getMainId, getFormattedTimeStamp,
  extractLinkFPath, extractPinFPath, getStaticFPath, extractTagFPath, getTags,
  getLastLinkFPaths,
} from '../utils';
import { initialSettingsState } from '../types/initialStates';
import vars from '../vars';

const importAllDataLoop = async (fpaths, contents) => {
  // One at a time to not overwhelm the server
  const nLinks = 1;
  for (let i = 0; i < fpaths.length; i += nLinks) {
    const _fpaths = fpaths.slice(i, i + nLinks);
    const _contents = contents.slice(i, i + nLinks);
    await dataApi.putFiles(_fpaths, _contents);

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
    const { contents } = await dataApi.getFiles([lastSettingsFPath], true);
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

      content = content.slice(k + 1);

      const destFPath = `${Dirs.DocumentDir}/${fpath}`;
      const destDPath = Util.dirname(destFPath);
      const doExist = await FileSystem.exists(destDPath);
      if (!doExist) await FileSystem.mkdir(destDPath);
      await FileSystem.writeFile(destFPath, content, BASE64);

      fpaths.push('file://' + fpath);
      contents.push('');
    }

    await importAllDataLoop(fpaths, contents);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseBraceLinks = async (
  dispatch, existFPaths, existMainIds, linkEntries, progress
) => {
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
        if (![3, 4].includes(tokens.length)) continue;
        if (!(/^\d+$/.test(tokens[0]))) continue;
        if (tokens.length === 4 && !(/^\d+$/.test(tokens[3]))) continue;
      }

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

const parseBraceTags = async (dispatch, tags, tagEntries, progress) => {
  for (let i = 0, j = tagEntries.length; i < j; i += N_LINKS) {
    const selectedEntries = tagEntries.slice(i, i + N_LINKS);

    const fpaths = [], contents = [];
    for (const entry of selectedEntries) {
      const { fpathParts, fnameParts } = extractFPath(entry.path);
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

      const mainId = getMainId(id);
      if (
        isObject(tags[mainId]) &&
        tags[mainId].values.some(value => value.tagName === tagName)
      ) {
        continue;
      }

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
  const {
    linkFPaths: allLinkFPaths, staticFPaths, settingsFPaths, pinFPaths, tagFPaths,
  } = await dataApi.listFPaths();

  const existFPaths = [], existMainIds = [];
  existFPaths.push(...staticFPaths);

  const linkFPaths = getLastLinkFPaths(allLinkFPaths);
  for (const listName in linkFPaths) {
    for (const fpath of linkFPaths[listName]) {
      const { id } = extractLinkFPath(fpath);
      existFPaths.push(fpath);
      existMainIds.push(getMainId(id));
    }
  }

  const pins = getPins(pinFPaths, {}, false);
  const tags = getTags(tagFPaths, {});

  const linkEntries = [], pinEntries = [], tagEntries = [], imgEntries = [];
  const settingsEntries = [];
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
    linkEntries.length + pinEntries.length + tagEntries.length + imgEntries.length +
    settingsEntries.length
  );
  const progress = { total, done: 0 };
  dispatch(updateImportAllDataProgress(progress));

  if (progress.total === 0) return;

  await parseBraceSettings(dispatch, settingsFPaths, settingsEntries, progress);
  await parseBraceImages(dispatch, existFPaths, imgEntries, progress);

  await parseBraceLinks(dispatch, existFPaths, existMainIds, linkEntries, progress);
  await parseBracePins(dispatch, pins, pinEntries, progress);
  await parseBraceTags(dispatch, tags, tagEntries, progress);
};

const parseImportedFile = async (dispatch, getState, text) => {
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

const _importAllData = async (dispatch, getState) => {
  dispatch(updateImportAllDataProgress({ total: 'calculating...', done: 0 }));

  try {
    const results = await DocumentPicker.pick({
      type: DocumentPickerTypes.allFiles,
      copyTo: 'cachesDirectory',
    });
    const result = results[0];
    if (!isObject(result) || !isString(result.fileCopyUri)) {
      dispatch(updateImportAllDataProgress(null));

      const error = result.copyError || '';
      Alert.alert('Read file failed!', `Could not read the content in the file. Please recheck your file.\n\n${error}`);
      return;
    }

    const fext = Util.extname(result.fileCopyUri);
    if (!['txt', 'htm', 'html'].includes(fext)) {
      dispatch(updateImportAllDataProgress(null));
      Alert.alert('Read file failed!', 'Could not read the content in the file. Only a file ending with .txt or .html can be imported.');
      return;
    }

    const text = await FileSystem.readFile(result.fileCopyUri, UTF8);
    await parseImportedFile(dispatch, getState, text);
  } catch (error) {
    dispatch(updateImportAllDataProgress(null));
    if (DocumentPicker.isCancel(error)) return;

    Alert.alert('Read file failed!', `Could not read the content in the file. Please recheck your file.\n\n${error}`);
  }
};

export const importAllData = () => async (dispatch, getState) => {
  if (vars.importAllData.didPick) return;
  vars.importAllData.didPick = true;
  await _importAllData(dispatch, getState);
  vars.importAllData.didPick = false;
};

export const updateImportAllDataProgress = (progress) => {
  return {
    type: UPDATE_IMPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

export const saveAs = async (filePath, fileName) => {
  if (Platform.OS === 'ios') {
    try {
      await Share.open({ url: 'file://' + filePath });
    } catch (error) {
      if (isObject(error)) {
        if (
          isObject(error.error) &&
          isString(error.error.message) &&
          error.error.message.includes('The operation was cancelled')
        ) return;
        if (
          isString(error.message) &&
          error.message.includes('User did not share')
        ) return;
      }

      Alert.alert('Exporting Data Error!', `Please wait a moment and try again. If the problem persists, please contact us.\n\n${error}`);
    }

    return;
  }

  if (Platform.OS === 'android') {
    if (Platform.Version < 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Permission denied',
          'We don\'t have permission to save the exported data file in Downloads.\n\nPlease grant this permission in Settings -> Apps -> Permissions.',
        );
        return;
      }
    }

    try {
      await FileSystem.cpExternal(filePath, fileName, 'downloads');
      Alert.alert(
        'Export completed',
        `The exported data file - ${fileName} - has been saved in Downloads.`,
      );
    } catch (error) {
      Alert.alert('Exporting Data Error!', `Please wait a moment and try again. If the problem persists, please contact us.\n\n${error}`);
    }

    return;
  }

  console.log('Invalid platform: ', Platform.OS);
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

  const linkFPaths = [], pinFPaths = [], tagFPaths = [], settingsFPaths = [];
  const linkMainIds = [];

  const lastLinkFPaths = getLastLinkFPaths(lfpRst.linkFPaths);
  for (const listName in lastLinkFPaths) {
    for (const fpath of lastLinkFPaths[listName]) {
      if (!_canExport(listName, lockSettings)) continue;

      const { id } = extractLinkFPath(fpath);
      linkFPaths.push(fpath);
      linkMainIds.push(getMainId(id));
    }
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

  const lastSettingsFPaths = getLastSettingsFPaths(lfpRst.settingsFPaths);
  if (lastSettingsFPaths.fpaths.length > 0) {
    const lastSettingsFPath = lastSettingsFPaths.fpaths[0];
    const { contents } = await dataApi.getFiles([lastSettingsFPath], true);
    if (!isEqual(initialSettingsState, contents[0])) {
      settingsFPaths.push(lastSettingsFPath);
    }
  }

  const total = (
    linkFPaths.length + pinFPaths.length + tagFPaths.length + settingsFPaths.length
  );
  const progress = { total, done: 0 };
  dispatch(updateExportAllDataProgress(progress));

  if (progress.total === 0) return;

  try {
    const successResponses = [], errorResponses = [], nLinks = 1;
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

            const srcFPath = `${Dirs.DocumentDir}/${path}`;
            const doExist = await FileSystem.exists(srcFPath);
            if (!doExist) continue;
            data = await FileSystem.readFile(srcFPath, BASE64);

            data = `data:application/octet-stream;base64,${data}`;
          } else {
            //if (isUint8Array(data)) data = new Blob([data]);
            //if (isBlob(data)) data = await convertBlobToDataUrl(data);
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

    const ptFPaths = [...pinFPaths, ...tagFPaths];
    for (let i = 0; i < ptFPaths.length; i += N_LINKS) {
      const selectedFPaths = ptFPaths.slice(i, i + N_LINKS);
      for (const fpath of selectedFPaths) {
        const path = fpath, data = {};
        successResponses.push({ path, data });
      }

      progress.done += selectedFPaths.length;
      if (progress.done < progress.total) {
        dispatch(updateExportAllDataProgress(progress));
      }
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
    const filePath = `${Dirs.CacheDir}/${fileName}`;
    const doFileExist = await FileSystem.exists(filePath);
    if (doFileExist) await FileSystem.unlink(filePath);

    await FileSystem.writeFile(
      filePath, JSON.stringify(successResponses, null, 2), UTF8
    );
    await saveAs(filePath, fileName);

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

  const fpaths = [], lastFPaths = [];

  const lastLinkFPaths = getLastLinkFPaths(lfpRst.linkFPaths);
  for (const listName in lastLinkFPaths) {
    for (const fpath of lastLinkFPaths[listName]) lastFPaths.push(fpath);
  }
  for (const listName in lfpRst.linkFPaths) {
    for (const fpath of lfpRst.linkFPaths[listName]) {
      if (lastFPaths.includes(fpath)) continue;
      fpaths.push(fpath);
    }
  }

  const lastSettingsFPaths = getLastSettingsFPaths(lfpRst.settingsFPaths);
  lastFPaths.push(...lastSettingsFPaths.fpaths);
  for (const fpath of lfpRst.settingsFPaths) {
    if (lastFPaths.includes(fpath)) continue;
    fpaths.push(fpath);
  }

  fpaths.push(...lfpRst.staticFPaths);
  if (isString(lfpRst.infoFPath)) fpaths.push(lfpRst.infoFPath);
  fpaths.push(...lfpRst.pinFPaths);
  fpaths.push(...lfpRst.tagFPaths);
  fpaths.push(...lastFPaths);

  const progress = { total: fpaths.length, done: 0 };
  dispatch(updateDeleteAllDataProgress(progress));

  if (progress.total === 0) return;

  try {
    const nLinks = 1;
    for (let i = 0, j = fpaths.length; i < j; i += nLinks) {
      const selectedFPaths = fpaths.slice(i, i + nLinks);
      await dataApi.deleteFiles(selectedFPaths);

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
