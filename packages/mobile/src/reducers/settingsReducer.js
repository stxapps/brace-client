import { REHYDRATE } from 'redux-persist/constants';
import { loop, Cmd } from 'redux-loop';

import { updateFetchedSettings } from '../actions';
import {
  FETCH_COMMIT, ADD_LIST_NAMES, UPDATE_LIST_NAMES, MOVE_LIST_NAME, MOVE_TO_LIST_NAME,
  DELETE_LIST_NAMES, UPDATE_DO_EXTRACT_CONTENTS, UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH,
  UPDATE_DO_DESCENDING_ORDER, CANCEL_DIED_SETTINGS,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { SWAP_LEFT, SWAP_RIGHT } from '../types/const';
import {
  getListNameObj, doContainListName, copyListNameObjs, swapArrayElements,
} from '../utils';
import { initialSettingsState as initialState } from '../types/initialStates';

const settingsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.settings };
  }

  if (action.type === FETCH_COMMIT) {
    const { listNames, doFetchSettings, settings } = action.payload;
    if (!doFetchSettings) return state;

    const newState = settings ? { ...initialState, ...settings } : { ...initialState };
    newState.listNameMap = copyListNameObjs(newState.listNameMap);

    let i = 1;
    for (const listName of listNames) {
      if (!doContainListName(listName, newState.listNameMap)) {
        newState.listNameMap.push(
          { listName: listName, displayName: `<missing-name-${i}>` }
        );
        i += 1;
      }
    }

    return loop(
      newState,
      Cmd.run(
        updateFetchedSettings(),
        { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === ADD_LIST_NAMES) {
    const newState = { ...state };
    newState.listNameMap = [...state.listNameMap, ...action.payload];

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

    return newState;
  }

  if (action.type === DELETE_LIST_NAMES) {
    const { listNames } = action.payload;

    const newState = { ...state };
    newState.listNameMap = copyListNameObjs(newState.listNameMap, listNames);

    return newState;
  }

  if (action.type === UPDATE_DO_EXTRACT_CONTENTS) {
    return { ...state, doExtractContents: action.payload };
  }

  if (action.type === UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH) {
    return { ...state, doDeleteOldLinksInTrash: action.payload };
  }

  if (action.type === UPDATE_DO_DESCENDING_ORDER) {
    return { ...state, doDescendingOrder: action.payload };
  }

  if (action.type === CANCEL_DIED_SETTINGS) {
    const { settings } = action.payload;
    return { ...state, ...settings };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default settingsReducer;
