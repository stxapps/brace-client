import { REHYDRATE } from 'redux-persist/constants';

import { addNextAction } from '../store-next';
import { updateDefaultPreference } from '../actions';
import { updateSettingsDeleteStep, mergeSettingsDeleteStep } from '../importWrapper';
import {
  FETCH_COMMIT, ADD_LIST_NAMES, UPDATE_LIST_NAMES, MOVE_LIST_NAME, MOVE_TO_LIST_NAME,
  DELETE_LIST_NAMES, UPDATE_TAG_DATA_S_STEP, UPDATE_TAG_DATA_S_STEP_COMMIT,
  CANCEL_DIED_TAGS, ADD_TAG_NAMES, UPDATE_TAG_NAMES, MOVE_TAG_NAME, DELETE_TAG_NAMES,
  UPDATE_DO_EXTRACT_CONTENTS, UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH,
  UPDATE_DO_DESCENDING_ORDER, UPDATE_DEFAULT_LAYOUT_TYPE, UPDATE_DEFAULT_THEME,
  UPDATE_SETTINGS_COMMIT, UPDATE_UNCHANGED_SETTINGS, CANCEL_DIED_SETTINGS,
  MERGE_SETTINGS_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { MY_LIST, TRASH, ARCHIVE, SWAP_LEFT, SWAP_RIGHT } from '../types/const';
import {
  getListNameObj, doContainListName, copyListNameObjs, swapArrayElements,
  deriveSettingsState, getTagNameObj, copyTagNameObjs,
} from '../utils';
import {
  initialSettingsState as initialState,
  myListListNameObj, trashListNameObj, archiveListNameObj,
} from '../types/initialStates';
import { didChange } from '../vars';

const settingsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    const newState = { ...initialState, ...action.payload.settings };

    // Copy listNameObjs to remove status in listNameObj
    //   to prevent mismatch between settings and snapshotSettings in beforeunload.
    newState.listNameMap = copyListNameObjs(newState.listNameMap);

    return newState;
  }

  if (action.type === FETCH_COMMIT) {
    const {
      doFetchStgsAndInfo, settings, conflictedSettings, listNames, tagNames,
    } = action.payload;
    if (!doFetchStgsAndInfo) return state;

    let newState = deriveSettingsState(listNames, tagNames, settings, initialState);
    if (Array.isArray(conflictedSettings) && conflictedSettings.length > 0) {
      newState = { ...state };
    }

    if (didChange.doExtractContents) {
      newState.doExtractContents = state.doExtractContents;
    }
    if (didChange.doDeleteOldLinksInTrash) {
      newState.doDeleteOldLinksInTrash = state.doDeleteOldLinksInTrash;
    }
    if (didChange.doDescendingOrder) {
      newState.doDescendingOrder = state.doDescendingOrder;
    }
    if (didChange.listNameMap) {
      newState.listNameMap = state.listNameMap;
    }
    if (didChange.tagNameMap) {
      newState.tagNameMap = state.tagNameMap;
    }
    if (didChange.newTagNameObjs.length > 0) {
      newState.tagNameMap = addTagNameObjs(
        newState.tagNameMap, didChange.newTagNameObjs
      );
    }

    updateDefaultPreference(newState.doExtractContents);
    return newState;
  }

  if (action.type === ADD_LIST_NAMES) {
    const newState = { ...state };
    newState.listNameMap = [...state.listNameMap, ...action.payload];

    didChange.listNameMap = true;

    return newState;
  }

  if (action.type === UPDATE_LIST_NAMES) {
    const { listNames, newNames } = action.payload;

    const newState = { ...state };
    newState.listNameMap = copyListNameObjs(newState.listNameMap);

    for (let i = 0; i < listNames.length; i++) {
      const { listNameObj } = getListNameObj(listNames[i], newState.listNameMap);
      if (!listNameObj) {
        console.log(`settingsReducer - UPDATE_LIST_NAMES, not found listName: ${listNames[i]}, in listNameMap: `, newState.listNameMap);
        continue;
      }
      listNameObj.displayName = newNames[i];
    }

    didChange.listNameMap = true;

    return newState;
  }

  if (action.type === MOVE_LIST_NAME) {
    const { listName, direction } = action.payload;

    const newState = { ...state };
    newState.listNameMap = copyListNameObjs(newState.listNameMap);

    const { listNameObj, parent } = getListNameObj(listName, newState.listNameMap);
    if (!listNameObj) {
      console.log(`settingsReducer - MOVE_LIST_NAME, not found listName: ${listName} in listNameMap: `, newState.listNameMap);
      return state;
    }

    let parentListNameObj = null;
    if (parent) {
      const { listNameObj: obj } = getListNameObj(parent, newState.listNameMap);
      if (!obj) {
        console.log(`settingsReducer - MOVE_LIST_NAME, not found listName: ${parent} in listNameMap: `, newState.listNameMap);
        return state;
      }
      if (!obj.children) {
        console.log(`settingsReducer - MOVE_LIST_NAME, not found children of listName: ${parent} in listNameMap: `, newState.listNameMap);
        return state;
      }
      parentListNameObj = obj;
    }

    const _listNameMap = parent ? parentListNameObj.children : newState.listNameMap;

    const i = _listNameMap.findIndex(obj => obj.listName === listName);
    if (i < 0) {
      console.log(`settingsReducer - MOVE_LIST_NAME, not found listName: ${listName} in listNameMap: `, _listNameMap);
      return state;
    }

    let newListNameMap;
    if (direction === SWAP_LEFT) {
      newListNameMap = swapArrayElements(_listNameMap, i - 1, i);
    } else if (direction === SWAP_RIGHT) {
      newListNameMap = swapArrayElements(_listNameMap, i, i + 1);
    } else {
      throw new Error(`Invalid direction: ${direction}`);
    }

    if (parent) parentListNameObj.children = newListNameMap;
    else newState.listNameMap = newListNameMap;

    didChange.listNameMap = true;

    return newState;
  }

  if (action.type === MOVE_TO_LIST_NAME) {
    const { listName, parent } = action.payload;

    const newState = { ...state };
    newState.listNameMap = copyListNameObjs(newState.listNameMap);

    const { listNameObj } = getListNameObj(listName, newState.listNameMap);
    if (!listNameObj) {
      console.log(`settingsReducer - MOVE_TO_LIST_NAME, not found listName: ${listName} in listNameMap: `, newState.listNameMap);
      return state;
    }

    newState.listNameMap = copyListNameObjs(newState.listNameMap, [listName]);

    if (!parent) {
      newState.listNameMap.push(listNameObj);
      return newState;
    }

    const { listNameObj: parentListNameObj } = getListNameObj(
      parent, newState.listNameMap
    );
    if (!parentListNameObj) {
      console.log(`settingsReducer - MOVE_TO_LIST_NAME, not found listName: ${parent} in listNameMap: `, newState.listNameMap);
      return state;
    }

    if (!parentListNameObj.children) parentListNameObj.children = [];
    parentListNameObj.children.push(listNameObj);

    didChange.listNameMap = true;

    return newState;
  }

  if (action.type === DELETE_LIST_NAMES) {
    const { listNames } = action.payload;

    const newState = { ...state };
    newState.listNameMap = copyListNameObjs(newState.listNameMap, listNames);

    if (!doContainListName(MY_LIST, newState.listNameMap)) {
      newState.listNameMap.push({ ...myListListNameObj });
    }
    if (!doContainListName(TRASH, newState.listNameMap)) {
      newState.listNameMap.push({ ...trashListNameObj });
    }
    if (!doContainListName(ARCHIVE, newState.listNameMap)) {
      newState.listNameMap.push({ ...archiveListNameObj });
    }

    didChange.listNameMap = true;

    return newState;
  }

  if (action.type === UPDATE_TAG_DATA_S_STEP) {
    const { newTagNameObjs } = action.payload;
    if (newTagNameObjs.length === 0) return state;

    const newState = { ...state };
    newState.tagNameMap = addTagNameObjs(state.tagNameMap, newTagNameObjs);

    didChange.newTagNameObjs = addTagNameObjs(didChange.newTagNameObjs, newTagNameObjs);

    return newState;
  }

  if (action.type === UPDATE_TAG_DATA_S_STEP_COMMIT) {
    const { newTagNameObjs } = action.meta;

    const usedTagNames = newTagNameObjs.map(obj => obj.tagName);
    didChange.newTagNameObjs = didChange.newTagNameObjs.filter(obj => {
      return !usedTagNames.includes(obj.tagName);
    });

    const { doUpdateSettings, _settingsFPaths } = action.payload;
    if (!doUpdateSettings) return state;

    addNextAction(updateSettingsDeleteStep(_settingsFPaths));
    return state;
  }

  if (action.type === CANCEL_DIED_TAGS) {
    const { unusedTagNames } = action.payload;

    const newState = { ...state };
    newState.tagNameMap = newState.tagNameMap.filter(tagNameObj => {
      return !unusedTagNames.includes(tagNameObj.tagName);
    });

    didChange.newTagNameObjs = didChange.newTagNameObjs.filter(obj => {
      return !unusedTagNames.includes(obj.tagName);
    });

    return newState;
  }

  if (action.type === ADD_TAG_NAMES) {
    const newState = { ...state };
    newState.tagNameMap = [...state.tagNameMap, ...action.payload];

    didChange.tagNameMap = true;

    return newState;
  }

  if (action.type === UPDATE_TAG_NAMES) {
    const { tagNames, newNames } = action.payload;

    const newState = { ...state };
    newState.tagNameMap = copyTagNameObjs(newState.tagNameMap);

    for (let i = 0; i < tagNames.length; i++) {
      const { tagNameObj } = getTagNameObj(tagNames[i], newState.tagNameMap);
      if (!tagNameObj) {
        console.log(`settingsReducer - UPDATE_TAG_NAMES, not found tagName: ${tagNames[i]}, in tagNameMap: `, newState.tagNameMap);
        continue;
      }
      tagNameObj.displayName = newNames[i];
    }

    didChange.tagNameMap = true;

    return newState;
  }

  if (action.type === MOVE_TAG_NAME) {
    const { tagName, direction } = action.payload;

    const newState = { ...state };
    newState.tagNameMap = copyTagNameObjs(newState.tagNameMap);

    const _tagNameMap = newState.tagNameMap;
    const i = _tagNameMap.findIndex(obj => obj.tagName === tagName);
    if (i < 0) {
      console.log(`settingsReducer - MOVE_TAG_NAME, not found tagName: ${tagName} in tagNameMap: `, _tagNameMap);
      return state;
    }

    let newTagNameMap;
    if (direction === SWAP_LEFT) {
      newTagNameMap = swapArrayElements(_tagNameMap, i - 1, i);
    } else if (direction === SWAP_RIGHT) {
      newTagNameMap = swapArrayElements(_tagNameMap, i, i + 1);
    } else {
      throw new Error(`Invalid direction: ${direction}`);
    }

    newState.tagNameMap = newTagNameMap;

    didChange.tagNameMap = true;

    return newState;
  }

  if (action.type === DELETE_TAG_NAMES) {
    const { tagNames } = action.payload;

    const newState = { ...state };
    newState.tagNameMap = copyTagNameObjs(newState.tagNameMap, tagNames);

    didChange.tagNameMap = true;

    return newState;
  }

  if (action.type === UPDATE_DO_EXTRACT_CONTENTS) {
    didChange.doExtractContents = true;
    return { ...state, doExtractContents: action.payload };
  }

  if (action.type === UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH) {
    didChange.doDeleteOldLinksInTrash = true;
    return { ...state, doDeleteOldLinksInTrash: action.payload };
  }

  if (action.type === UPDATE_DO_DESCENDING_ORDER) {
    didChange.doDescendingOrder = true;
    return { ...state, doDescendingOrder: action.payload };
  }

  if (action.type === UPDATE_DEFAULT_LAYOUT_TYPE) {
    return { ...state, layoutType: action.payload };
  }

  if (action.type === UPDATE_DEFAULT_THEME) {
    const { mode, customOptions } = action.payload;
    return { ...state, themeMode: mode, themeCustomOptions: customOptions };
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    const { _settingsFPaths } = action.payload;
    didChange.doExtractContents = false;
    didChange.doDeleteOldLinksInTrash = false;
    didChange.doDescendingOrder = false;
    didChange.listNameMap = false;
    didChange.tagNameMap = false;

    updateDefaultPreference(state.doExtractContents);
    addNextAction(updateSettingsDeleteStep(_settingsFPaths));
    return state;
  }

  if (action.type === UPDATE_UNCHANGED_SETTINGS) {
    didChange.doExtractContents = false;
    didChange.doDeleteOldLinksInTrash = false;
    didChange.doDescendingOrder = false;
    didChange.listNameMap = false;
    didChange.tagNameMap = false;
    return state;
  }

  if (action.type === CANCEL_DIED_SETTINGS) {
    const { listNames, tagNames, settings } = action.payload;
    didChange.doExtractContents = false;
    didChange.doDeleteOldLinksInTrash = false;
    didChange.doDescendingOrder = false;
    didChange.listNameMap = false;
    didChange.tagNameMap = false;

    const newState = deriveSettingsState(listNames, tagNames, settings, initialState);
    updateDefaultPreference(newState.doExtractContents);
    return newState;
  }

  if (action.type === MERGE_SETTINGS_COMMIT) {
    const { listNames, tagNames, settings, _settingsFPaths } = action.meta;
    didChange.doExtractContents = false;
    didChange.doDeleteOldLinksInTrash = false;
    didChange.doDescendingOrder = false;
    didChange.listNameMap = false;
    didChange.tagNameMap = false;

    const newState = deriveSettingsState(listNames, tagNames, settings, initialState);
    updateDefaultPreference(newState.doExtractContents);
    addNextAction(mergeSettingsDeleteStep(_settingsFPaths));
    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    didChange.doExtractContents = false;
    didChange.doDeleteOldLinksInTrash = false;
    didChange.doDescendingOrder = false;
    didChange.listNameMap = false;
    didChange.tagNameMap = false;
    didChange.newTagNameObjs = [];

    const newState = { ...initialState };
    if (action.type === DELETE_ALL_DATA) {
      updateDefaultPreference(newState.doExtractContents);
    }
    return newState;
  }

  return state;
};

const addTagNameObjs = (tagNameMap, tagNameObjs) => {
  const tagNames = [];

  const newTagNameMap = [];
  for (const obj of [...tagNameMap, ...tagNameObjs]) {
    if (tagNames.includes(obj.tagName)) continue;
    newTagNameMap.push({ ...obj });
    tagNames.push(obj.tagName);
  }

  return newTagNameMap;
};

export default settingsReducer;
