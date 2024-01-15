import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_FETCHED, CACHE_FETCHED_MORE, UPDATE_FETCHED_MORE, REFRESH_FETCHED,
  MOVE_LINKS_ADD_STEP_COMMIT, DELETE_LINKS_COMMIT, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  UPDATE_CUSTOM_DATA_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { getArraysPerKey, getMainId, extractLinkId } from '../utils';

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
    action.type === MOVE_LINKS_ADD_STEP_COMMIT ||
    action.type === DELETE_LINKS_COMMIT ||
    action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT
  ) {
    let idsPerLn;
    if (action.type === MOVE_LINKS_ADD_STEP_COMMIT) {
      const { successLinks } = action.payload;

      const fromListNames = [], fromIds = [];
      for (const link of successLinks) {
        const { fromListName, fromId } = link;
        fromListNames.push(fromListName);
        fromIds.push(fromId);
      }

      idsPerLn = getArraysPerKey(fromListNames, fromIds);
    } else {
      const { successListNames, successIds } = action.payload;
      idsPerLn = getArraysPerKey(successListNames, successIds);
    }

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(idsPerLn)) {
      if (!newState[listName]) continue;

      const { payload } = newState[listName];

      const newLinks = { ...payload.links };
      newLinks[listName] = {};
      for (const id in payload.links[listName]) {
        if (lnIds.includes(id)) continue;
        newLinks[listName][id] = { ...payload.links[listName][id] };
      }

      const newPayload = { ...payload };
      newPayload.unfetchedLinkMetas = newPayload.unfetchedLinkMetas.filter(meta => {
        return !lnIds.includes(meta.id);
      });
      newPayload.links = newLinks;

      newState[listName] = { payload: newPayload };
    }

    return newState;
  }

  if (action.type === UPDATE_CUSTOM_DATA_COMMIT) {
    const { listName, fromLink, toLink } = action.payload;
    if (!state[listName]) return state;

    const { payload } = state[listName];

    const newLinks = { ...payload.links };
    newLinks[listName] = { ...newLinks[listName] };

    const metas = [], fromIds = [];
    if (fromLink.id in newLinks[listName]) {
      const { id } = toLink;
      const { addedDT, updatedDT } = extractLinkId(id);
      metas.push({ id, addedDT, updatedDT, fpaths: [], listName });
      fromIds.push(fromLink.id);

      delete newLinks[listName][fromLink.id];
      newLinks[listName][toLink.id] = { ...toLink };
    }

    const newPayload = { ...payload };
    newPayload.unfetchedLinkMetas = newPayload.unfetchedLinkMetas.filter(meta => {
      return !fromIds.includes(meta.id);
    });
    newPayload.unfetchedLinkMetas = _append(newPayload.unfetchedLinkMetas, metas);
    newPayload.links = newLinks;

    return { ...state, [listName]: { payload: newPayload } };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

const _append = (arr, metas) => {
  const newArr = [], mainIds = [];
  for (const meta of [...metas, ...arr]) {
    const mainId = getMainId(meta.id);
    if (mainIds.includes(mainId)) continue;
    newArr.push(meta);
    mainIds.push(mainId);
  }
  return newArr;
};

export default fetchedMoreReducer;
