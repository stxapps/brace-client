import { REHYDRATE } from 'redux-persist/constants'

import {
  FETCH_COMMIT,
  ADD_LIST_NAMES, ADD_LIST_NAMES_COMMIT, ADD_LIST_NAMES_ROLLBACK,
  UPDATE_LIST_NAMES, UPDATE_LIST_NAMES_COMMIT, UPDATE_LIST_NAMES_ROLLBACK,
  MOVE_LIST_NAME, MOVE_LIST_NAME_COMMIT, MOVE_LIST_NAME_ROLLBACK,
  DELETE_LIST_NAMES, DELETE_LIST_NAMES_COMMIT, DELETE_LIST_NAMES_ROLLBACK,
  RETRY_ADD_LIST_NAMES, RETRY_UPDATE_LIST_NAMES, RETRY_MOVE_LIST_NAME,
  RETRY_DELETE_LIST_NAMES, CANCEL_DIED_LIST_NAMES,
  UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  MY_LIST, TRASH, ARCHIVE,
  ADDED, ADDING, UPDATING, MOVING, DELETING,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING,
  SWAP_LEFT, SWAP_RIGHT,
} from '../types/const';
import { doContainListName, swapArrayElements, getInsertIndex } from '../utils';

const initialState = {
  defaultListName: MY_LIST,
  doEncrypt: true,
  doExtractContents: true,
  doDeleteOldLinksInTrash: true,
  doDescendingOrder: true,
  doRemoveAfterClick: false,
  doExitBulkEditAfterAction: true,
  listNameMap: [
    { listName: MY_LIST, displayName: MY_LIST, status: ADDED },
    { listName: TRASH, displayName: TRASH, status: ADDED },
    { listName: ARCHIVE, displayName: ARCHIVE, status: ADDED }
  ],
};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.settings };
  }

  if (action.type === FETCH_COMMIT) {

    const { settings } = action.payload;
    if (!settings) {
      return state;
    }

    const newState = settings;
    newState.listNameMap = settings.listNameMap.map(listNameObj => {
      return { ...listNameObj, status: ADDED };
    });

    const processingListNameObjs = state.listNameMap.filter(listNameObj => {
      return listNameObj.status !== ADDED;
    });

    newState.listNameMap = newState.listNameMap.filter(listNameObj => {
      return !doContainListName(listNameObj.listName, processingListNameObjs);
    });

    for (const processingListNameObj of processingListNameObjs) {
      const i = getInsertIndex(processingListNameObj, state.listNameMap, newState.listNameMap)
      if (i >= 0) newState.listNameMap.splice(i, 0, processingListNameObj);
      else newState.listNameMap.push(processingListNameObj);
    }

    return newState;
  }

  if (action.type === ADD_LIST_NAMES) {

    let { listNameObjs } = action.payload;
    listNameObjs = listNameObjs.map(listNameObj => {
      return { ...listNameObj, status: ADDING };
    });

    const newState = { ...state };
    newState.listNameMap = [...state.listNameMap, ...listNameObjs];

    return newState;
  }

  if (action.type === ADD_LIST_NAMES_COMMIT) {

    const { listNameObjs } = action.meta;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.map(listNameObj => {
      if (doContainListName(listNameObj.listName, listNameObjs)) {
        return { ...listNameObj, status: ADDED };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === ADD_LIST_NAMES_ROLLBACK) {

    const { listNameObjs } = action.meta;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.map(listNameObj => {
      if (doContainListName(listNameObj.listName, listNameObjs)) {
        return { ...listNameObj, status: DIED_ADDING };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === UPDATE_LIST_NAMES) {

    const { listNames, newNames } = action.payload;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.map(listNameObj => {
      const i = listNames.indexOf(listNameObj.listName);
      if (i >= 0) {
        return {
          ...listNameObj,
          displayName: newNames[i],
          rollbackDisplayName: listNameObj.displayName,
          status: UPDATING,
        };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === UPDATE_LIST_NAMES_COMMIT) {

    const { listNames } = action.meta;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.map(listNameObj => {
      if (listNames.includes(listNameObj.listName)) {
        return { ...listNameObj, status: ADDED };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === UPDATE_LIST_NAMES_ROLLBACK) {

    const { listNames } = action.meta;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.map(listNameObj => {
      if (listNames.includes(listNameObj.listName)) {
        return { ...listNameObj, status: DIED_UPDATING };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === MOVE_LIST_NAME) {

    const { listName, direction } = action.payload;

    const newState = { ...state };

    const i = newState.listNameMap.findIndex(listNameObj => {
      return listNameObj.listName === listName;
    });
    if (i < 0) throw new Error(`Invalid listName: ${listName} and listNameMap: ${state.listNameMap}`);
    newState.listNameMap[i] = {
      ...newState.listNameMap[i],
      rollbackDirection: direction,
      status: MOVING,
    };

    if (direction === SWAP_LEFT) {
      newState.listNameMap = swapArrayElements(newState.listNameMap, i - 1, i);
    } else if (direction === SWAP_RIGHT) {
      newState.listNameMap = swapArrayElements(newState.listNameMap, i, i + 1);
    } else {
      throw new Error(`Invalid direction: ${direction}`);
    }

    return newState;
  }

  if (action.type === MOVE_LIST_NAME_COMMIT) {

    const { listName } = action.meta;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.map(listNameObj => {
      if (listNameObj.listName === listName) {
        return { ...listNameObj, status: ADDED };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === MOVE_LIST_NAME_ROLLBACK) {

    const { listName } = action.meta;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.map(listNameObj => {
      if (listNameObj.listName === listName) {
        return { ...listNameObj, status: DIED_MOVING };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === DELETE_LIST_NAMES) {

    const { listNames } = action.payload;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.map(listNameObj => {
      if (listNames.includes(listNameObj.listName)) {
        return { ...listNameObj, status: DELETING };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === DELETE_LIST_NAMES_COMMIT) {

    const { listNames } = action.meta;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.filter(listNameObj => {
      return !listNames.includes(listNameObj.listName);
    });

    return newState;
  }

  if (action.type === DELETE_LIST_NAMES_ROLLBACK) {

    const { listNames } = action.meta;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.map(listNameObj => {
      if (listNames.includes(listNameObj.listName)) {
        return { ...listNameObj, status: DIED_DELETING };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === RETRY_ADD_LIST_NAMES) {

    let { listNameObjs } = action.payload;

    const newState = { ...state };
    newState.listNameMap = newState.listNameMap.map(listNameObj => {
      if (doContainListName(listNameObj.listName, listNameObjs)) {
        return { ...listNameObj, status: ADDING };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === RETRY_UPDATE_LIST_NAMES) {

    let { listNames } = action.payload;

    const newState = { ...state };
    newState.listNameMap = newState.listNameMap.map(listNameObj => {
      if (listNames.includes(listNameObj.listName)) {
        return { ...listNameObj, status: UPDATING };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === RETRY_MOVE_LIST_NAME) {

    const { listName } = action.payload;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.map(listNameObj => {
      if (listNameObj.listName === listName) {
        return { ...listNameObj, status: MOVING };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === RETRY_DELETE_LIST_NAMES) {

    const { listNames } = action.payload;

    const newState = { ...state };
    newState.listNameMap = state.listNameMap.map(listNameObj => {
      if (listNames.includes(listNameObj.listName)) {
        return { ...listNameObj, status: DELETING };
      }
      return listNameObj;
    });

    return newState;
  }

  if (action.type === CANCEL_DIED_LIST_NAMES) {

    const { listNames } = action.payload;

    const movingListNames = [];
    const newState = { ...state };

    newState.listNameMap = [];
    for (const listNameObj of state.listNameMap) {
      if (!listNames.includes(listNameObj.listName)) {
        newState.listNameMap.push(listNameObj);
        continue;
      }

      // DIED_ADDING -> remove this link
      // DIED_UPDATING -> set display name to previous and status to ADDED
      // DIED_MOVING -> just add here and move back below
      // DIED_DELETING -> just set status to ADDED
      const { status } = listNameObj;
      if (status === DIED_ADDING) {
        continue;
      } else if (status === DIED_UPDATING) {
        newState.listNameMap.push({
          ...listNameObj,
          displayName: listNameObj.rollbackDisplayName,
          status: ADDED,
        });
      } else if (status === DIED_MOVING) {
        movingListNames.push(listNameObj.listName);
        newState.listNameMap.push({ ...listNameObj, status: ADDED });
      } else if (status === DIED_DELETING) {
        newState.listNameMap.push({ ...listNameObj, status: ADDED });
      } else {
        throw new Error(`Invalid status: ${status} of listNameObj: ${listNameObj}`);
      }
    }

    for (const movingListName of movingListNames) {
      const i = newState.listNameMap.findIndex(obj => obj.listName === movingListName);
      if (i < 0) throw new Error(`Invalid movingListName: ${movingListName} and listNameMap: ${newState.listNameMap}`);

      const movingListNameObj = newState.listNameMap[i];
      if (movingListNameObj.rollbackDirection === SWAP_LEFT) {
        newState.listNameMap = swapArrayElements(newState.listNameMap, i, i + 1);
      } else if (movingListNameObj.rollbackDirection === SWAP_RIGHT) {
        newState.listNameMap = swapArrayElements(newState.listNameMap, i - 1, i);
      } else {
        throw new Error(`Invalid direction: ${movingListNameObj.rollbackDirection}`);
      }
    }

    return newState;
  }

  if (action.type === UPDATE_SETTINGS) {
    const { settings } = action.payload;
    return settings;
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    // Do nothing
  }

  if (action.type === UPDATE_SETTINGS_ROLLBACK) {
    const { rollbackValues } = action.meta;
    return { ...state, ...rollbackValues };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
