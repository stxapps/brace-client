import { REHYDRATE } from 'redux-persist/constants';
import { loop, Cmd } from 'redux-loop';

import { tryUpdateSettings, checkPurchases } from '../actions';
import {
  FETCH_COMMIT, ADD_LIST_NAMES, UPDATE_LIST_NAMES, MOVE_LIST_NAME, MOVE_TO_LIST_NAME,
  DELETE_LIST_NAMES, UPDATE_DO_EXTRACT_CONTENTS, UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH,
  UPDATE_DO_DESCENDING_ORDER, UPDATE_SETTINGS_COMMIT, CANCEL_DIED_SETTINGS,
  REQUEST_PURCHASE_COMMIT, RESTORE_PURCHASES_COMMIT, REFRESH_PURCHASES_COMMIT,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { MY_LIST, TRASH, ARCHIVE, SWAP_LEFT, SWAP_RIGHT, VALID } from '../types/const';
import {
  getListNameObj, doContainListName, copyListNameObjs, swapArrayElements,
  deriveSettingsState,
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
    const { listNames, doFetchSettings, settings } = action.payload;
    if (!doFetchSettings) return state;

    const newState = deriveSettingsState(listNames, settings, initialState);

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
    if (didChange.purchases) {
      // It can happen that FETCH_COMMIT is after just purchased
      //  and not close the settings popup yet
      //  i.e. 1. just open the app and go to purchase
      //       2. back to foreground and fetch again
      //  and replace the newly purchase with old value in settings from server.
      newState.purchases = state.purchases;
      newState.checkPurchasesDT = state.checkPurchasesDT;
    }

    if ([
      didChange.doExtractContents, didChange.doDeleteOldLinksInTrash,
      didChange.doDescendingOrder, didChange.listNameMap, didChange.purchases,
    ].includes(true)) {
      return newState;
    }
    return loop(
      newState, Cmd.run(checkPurchases(), { args: [Cmd.dispatch, Cmd.getState] })
    );
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

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    didChange.doExtractContents = false;
    didChange.doDeleteOldLinksInTrash = false;
    didChange.doDescendingOrder = false;
    didChange.listNameMap = false;
    didChange.purchases = false;
    return state;
  }

  if (action.type === CANCEL_DIED_SETTINGS) {
    const { settings } = action.payload;
    didChange.doExtractContents = false;
    didChange.doDeleteOldLinksInTrash = false;
    didChange.doDescendingOrder = false;
    didChange.listNameMap = false;
    didChange.purchases = false;
    return { ...state, ...settings };
  }

  if (action.type === REQUEST_PURCHASE_COMMIT) {
    const { status, purchase } = action.payload;
    if (status !== VALID || !purchase) return state;

    const newState = { ...state, checkPurchasesDT: Date.now() };

    if (Array.isArray(newState.purchases)) {
      newState.purchases = [...newState.purchases, { ...purchase }];
    } else newState.purchases = [{ ...purchase }];

    didChange.purchases = true;

    return loop(
      newState, Cmd.run(tryUpdateSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (
    action.type === RESTORE_PURCHASES_COMMIT ||
    action.type === REFRESH_PURCHASES_COMMIT
  ) {
    // It can happen that checkPurchases is after just purchased
    //  and replace old purchases with the current newly one.
    if (didChange.purchases) return state;

    const { status, purchases } = action.payload;
    if (status !== VALID || !purchases) return state;

    const newState = { ...state, checkPurchasesDT: Date.now() };

    if (purchases.length === 0) newState.purchases = null;
    else newState.purchases = purchases.map(p => ({ ...p }));

    return loop(
      newState, Cmd.run(tryUpdateSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    didChange.doExtractContents = false;
    didChange.doDeleteOldLinksInTrash = false;
    didChange.doDescendingOrder = false;
    didChange.listNameMap = false;
    didChange.purchases = false;
    return { ...initialState };
  }

  return state;
};

export default settingsReducer;
