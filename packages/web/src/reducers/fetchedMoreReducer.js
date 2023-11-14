import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_FETCHED, CACHE_FETCHED_MORE, UPDATE_FETCHED_MORE, REFRESH_FETCHED,
  MOVE_LINKS_DELETE_STEP_COMMIT, DELETE_LINKS_COMMIT, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  UPDATE_CUSTOM_DATA_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { createLinkFPath, getArraysPerKey } from '../utils';

const initialState = {};

const fetchedMoreReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === UPDATE_FETCHED) {
    const { lnOrQt } = action.payload;

    const newState = {};
    for (const k in state) {
      if (k !== lnOrQt) newState[k] = state[k];
    }

    return newState;
  }

  if (action.type === CACHE_FETCHED_MORE) {
    const { payload } = action;
    return { ...state, [payload.lnOrQt]: { payload } };
  }

  if (action.type === UPDATE_FETCHED_MORE) {
    const { lnOrQt } = action.payload;

    const newState = {};
    for (const k in state) {
      if (k !== lnOrQt) newState[k] = state[k];
    }

    return newState;
  }

  if (action.type === REFRESH_FETCHED) {
    return { ...initialState };
  }

  // Died links are always shown, so need to apply to cached links here too.
  if (
    action.type === MOVE_LINKS_DELETE_STEP_COMMIT ||
    action.type === DELETE_LINKS_COMMIT ||
    action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT
  ) {
    const { successListNames, successIds } = action.payload;

    const idsPerLn = getArraysPerKey(successListNames, successIds);

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(idsPerLn)) {
      if (!newState[listName]) continue;

      const { payload } = newState[listName];

      const fpaths = lnIds.map(id => createLinkFPath(listName, id));
      const newLinks = { ...payload.links };
      newLinks[listName] = {};
      for (const id in payload.links[listName]) {
        if (lnIds.includes(id)) continue;
        newLinks[listName][id] = { ...payload.links[listName][id] };
      }

      const newPayload = { ...payload };
      newPayload.unfetchedLinkFPaths = newPayload.unfetchedLinkFPaths.filter(fpath => {
        return !fpaths.includes(fpath);
      });
      newPayload.links = newLinks;

      newState[listName] = { payload: newPayload };
    }

    return newState;
  }

  if (action.type === UPDATE_CUSTOM_DATA_COMMIT) {
    const { listName, toLink } = action.payload;
    if (!state[listName]) return state;

    const { payload } = state[listName];

    const newLinks = { ...payload.links };
    newLinks[listName] = { ...newLinks[listName] };
    if (toLink.id in newLinks[listName]) {
      newLinks[listName][toLink.id] = { ...toLink };
    }

    const newPayload = { ...payload };
    newPayload.links = newLinks;

    return { ...state, [listName]: { payload: newPayload } };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default fetchedMoreReducer;
