import { REHYDRATE } from 'redux-persist/constants'

import {
  FETCH_COMMIT, UPDATE_FETCHED, FETCH_MORE_COMMIT,
  DELETE_LIST_NAMES_COMMIT,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  MY_LIST, TRASH, ARCHIVE,
  STATUS, ADDED, N_LINKS,
} from '../types/const';
import { _ } from '../utils';

const initialState = {
  [MY_LIST]: null,
  [TRASH]: null,
  [ARCHIVE]: null,
};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    const newState = { ...state };
    for (const k in action.payload.hasMoreLinks) {
      // Links is cut down to first N_LINKS to be able to compare and do update or not
      //   so hasMore needs to be updated to make sure can fetch more if any.
      newState[k] = action.payload.hasMoreLinks[k] || Object.keys(_.select(action.payload.links[k], STATUS, ADDED)).length > N_LINKS;
    }
    return newState;
  }

  if (action.type === FETCH_COMMIT) {
    const { listNames, doFetchSettings, settings } = action.payload;

    const newState = {};
    if (doFetchSettings) {
      if (settings) {
        for (const k of settings.listNameMap.map(obj => obj.listName)) {
          newState[k] = state[k] || null;
        }
      } else {
        for (const k of [MY_LIST, TRASH, ARCHIVE]) newState[k] = state[k];
      }
    } else {
      for (const k in state) newState[k] = state[k];
    }

    for (const name of listNames) {
      if (!(name in newState)) {
        newState[name] = null;
      }
    }

    return newState;
  }

  if (action.type === UPDATE_FETCHED) {
    const { listName, hasMore } = action.payload;

    const newState = { ...state };
    if (listName in newState) newState[listName] = hasMore;

    return newState;
  }

  if (action.type === FETCH_MORE_COMMIT) {
    const { listName, hasMore } = action.payload;
    return { ...state, [listName]: hasMore };
  }

  if (action.type === DELETE_LIST_NAMES_COMMIT) {

    const { listNames } = action.meta;

    const newState = {};
    for (const listName in state) {
      if (listNames.includes(listName)) continue;
      newState[listName] = state[listName];
    }

    return newState;
  }

  if (action.type === DELETE_ALL_DATA) {
    const newState = {};
    for (const k in initialState) {
      if (initialState.hasOwnProperty(k)) {
        newState[k] = false;
      }
    }
    return newState;
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
