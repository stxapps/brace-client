import { REHYDRATE } from 'redux-persist/constants';

import {
  CACHE_FETCHED, UPDATE_FETCHED, REFRESH_FETCHED, ADD_LINKS_COMMIT,
  MOVE_LINKS_DELETE_STEP_COMMIT, DELETE_LINKS_COMMIT, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  EXTRACT_CONTENTS_COMMIT, PIN_LINK_COMMIT, UPDATE_CUSTOM_DATA_COMMIT, DELETE_ALL_DATA,
  RESET_STATE,
} from '../types/actionTypes';
import { getLinkFPaths, extractLinkFPath, createLinkFPath } from '../utils';
import { getCachedFPaths } from '../vars';

const initialState = {};

const fetchedReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === CACHE_FETCHED) {
    const { payload } = action;
    return { ...state, [payload.lnOrQt]: { payload } };
  }

  if (action.type === UPDATE_FETCHED || action.type === REFRESH_FETCHED) {
    const { lnOrQt } = action.payload;

    const newState = {};
    for (const k in state) {
      if (k !== lnOrQt) newState[k] = state[k];
    }

    return newState;
  }

  if (action.type === ADD_LINKS_COMMIT) {
    const { listName, successLinks } = action.payload;
    if (!state[listName]) return state;

    const { payload } = state[listName];

    const fpaths = successLinks.map(link => createLinkFPath(listName, link.id));
    const newLinks = { ...payload.links };
    newLinks[listName] = { ...newLinks[listName] };
    for (const link of successLinks) newLinks[listName][link.id] = { ...link };

    const newPayload = { ...payload };
    newPayload.unfetchedLinkFPaths = _append(newPayload.unfetchedLinkFPaths, fpaths);
    newPayload.links = newLinks;

    return { ...state, [listName]: { payload: newPayload } };
  }

  if (
    action.type === MOVE_LINKS_DELETE_STEP_COMMIT ||
    action.type === DELETE_LINKS_COMMIT ||
    action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT
  ) {
    const { listName, successIds } = action.payload;
    if (!state[listName]) return state;

    const { payload } = state[listName];

    const fpaths = successIds.map(id => createLinkFPath(listName, id));
    const newLinks = { ...payload.links };
    newLinks[listName] = {};
    for (const id in payload.links[listName]) {
      if (successIds.includes(id)) continue;
      newLinks[listName][id] = { ...payload.links[listName][id] };
    }

    const newPayload = { ...payload };
    newPayload.unfetchedLinkFPaths = newPayload.unfetchedLinkFPaths.filter(fpath => {
      return !fpaths.includes(fpath);
    });
    newPayload.links = newLinks;

    return { ...state, [listName]: { payload: newPayload } };
  }

  if (action.type === EXTRACT_CONTENTS_COMMIT) {
    const { listName, successLinks } = action.payload;
    if (!state[listName]) return state;

    const { payload } = state[listName];

    const newLinks = { ...payload.links };
    newLinks[listName] = { ...newLinks[listName] };
    for (const link of successLinks) newLinks[listName][link.id] = { ...link };

    const newPayload = { ...payload };
    newPayload.links = newLinks;

    return { ...state, [listName]: { payload: newPayload } };
  }

  if (action.type === PIN_LINK_COMMIT) {
    const { listName, links } = action.meta;
    if (!state[listName]) return state;

    const { payload } = state[listName];

    // Add to the fetched only if also exists in fpaths to prevent pin on a link
    //   that was already moved/removed/deleted.
    const linkIds = [];
    const linkFPaths = getLinkFPaths({ cachedFPaths: getCachedFPaths() });
    if (Array.isArray(linkFPaths[listName])) {
      for (const fpath of linkFPaths[listName]) {
        const { id } = extractLinkFPath(fpath);
        linkIds.push(id);
      }
    }

    const filteredLinks = links.filter(link => linkIds.includes(link.id));

    const fpaths = filteredLinks.map(link => createLinkFPath(listName, link.id));
    const newLinks = { ...payload.links };
    newLinks[listName] = { ...newLinks[listName] };
    for (const link of filteredLinks) newLinks[listName][link.id] = { ...link };

    const newPayload = { ...payload };
    newPayload.unfetchedLinkFPaths = _append(newPayload.unfetchedLinkFPaths, fpaths);
    newPayload.links = newLinks;

    return { ...state, [listName]: { payload: newPayload } };
  }

  if (action.type === UPDATE_CUSTOM_DATA_COMMIT) {
    const { listName, toLink } = action.payload;
    if (!state[listName]) return state;

    const { payload } = state[listName];

    const newLinks = { ...payload.links };
    newLinks[listName] = { ...newLinks[listName] };
    newLinks[listName][toLink.id] = { ...toLink };

    const newPayload = { ...payload };
    newPayload.links = newLinks;

    return { ...state, [listName]: { payload: newPayload } };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

const _append = (arr, elems) => {
  const newArr = [...arr];
  for (const elem of elems) {
    if (newArr.includes(elem)) continue;
    newArr.push(elem);
  }
  return newArr;
};

export default fetchedReducer;
