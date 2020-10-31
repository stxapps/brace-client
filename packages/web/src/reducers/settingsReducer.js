import { REHYDRATE } from 'redux-persist/constants'

import {
  FETCH_COMMIT,
  ADD_LIST_NAMES, ADD_LIST_NAMES_COMMIT, ADD_LIST_NAMES_ROLLBACK,
  UPDATE_LIST_NAMES, UPDATE_LIST_NAMES_COMMIT, UPDATE_LIST_NAMES_ROLLBACK,
  MOVE_LIST_NAME, MOVE_LIST_NAME_COMMIT, MOVE_LIST_NAME_ROLLBACK,
  DELETE_LIST_NAMES, DELETE_LIST_NAMES_COMMIT, DELETE_LIST_NAMES_ROLLBACK,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  MY_LIST, TRASH, ARCHIVE,
  ADDED, ADDING, UPDATING, MOVING, DELETING,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING,
  SWAP_LEFT, SWAP_RIGHT,
} from '../types/const';
import { doContainListName, swapArrayElements } from '../utils';

const initialState = {
  defaultListName: MY_LIST,
  doEncrypt: true,
  doExtractContent: true,
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

    let newState = state;

    const { settings } = action.payload;
    if (settings) {
      newState = settings;
      newState.listNameMap = settings.listNameMap.map(listNameObj => {
        return { ...listNameObj, status: ADDED };
      });
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
        return { ...listNameObj, displayName: newNames[i], status: UPDATING };
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
    newState.listNameMap[i] = { ...newState.listNameMap[i], status: MOVING };

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

    const { listName } = action.payload;

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

    const { listName } = action.payload;

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

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
