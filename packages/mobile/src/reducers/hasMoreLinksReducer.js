import { REHYDRATE } from 'redux-persist/constants';

import {
  FETCH_COMMIT, UPDATE_FETCHED, UPDATE_FETCHED_MORE, UPDATE_SETTINGS,
  CANCEL_DIED_SETTINGS, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  MY_LIST, TRASH, ARCHIVE, STATUS, ADDED, N_LINKS,
} from '../types/const';
import { getAllListNames } from '../utils';
import { _ } from '../utils/obj';

const initialState = {
  [MY_LIST]: null,
  [TRASH]: null,
  [ARCHIVE]: null,
};

const hasMoreLinksReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    const newState = { ...state };
    for (const k in action.payload.hasMoreLinks) {
      // Links is cut down to first N_LINKS to be able to compare and do update or not
      //   so hasMore needs to be updated to make sure can fetch more if any.
      //
      // If doDescendingorder = false and has 10 links at local, hasMoreLinks is false.
      // If there are new links remotely, when fetch 10 updated links,
      //   they will be the same as new links are in the back.
      // doUpdate will be false and hasMoreLinks will also be false which is incorrect!
      //
      // If links is empty or too less to have a scroll and set hasMore to true,
      //   loading more will be shown with empty message or CardItems!
      newState[k] = action.payload.hasMoreLinks[k] || Object.keys(_.select(action.payload.links[k], STATUS, ADDED)).length > N_LINKS - 1;
    }
    return newState;
  }

  if (action.type === FETCH_COMMIT) {
    const { listNames, doFetchSettings, settings } = action.payload;

    const newState = {};
    if (doFetchSettings) {
      if (settings) {
        for (const k of getAllListNames(settings.listNameMap)) {
          // Be careful as possible values are true, false, null, undefined
          newState[k] = state[k] === undefined ? null : state[k];
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

  if (action.type === UPDATE_FETCHED_MORE) {
    const { listName, hasMore } = action.payload;
    return { ...state, [listName]: hasMore };
  }

  if (action.type === UPDATE_SETTINGS || action.type === CANCEL_DIED_SETTINGS) {
    const { settings } = action.payload;
    const listNames = getAllListNames(settings.listNameMap);

    const newState = {};
    for (const listName in state) {
      if (!listNames.includes(listName)) continue;
      newState[listName] = state[listName];
    }

    for (const k of listNames) {
      // Be careful as possible values are true, false, null, undefined
      if (newState[k] === undefined) newState[k] = null;
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

export default hasMoreLinksReducer;
