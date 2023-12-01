import { REHYDRATE } from 'redux-persist/constants';

import {
  CACHE_FETCHED, UPDATE_FETCHED, REFRESH_FETCHED, ADD_LINKS_COMMIT,
  MOVE_LINKS_DELETE_STEP_COMMIT, DELETE_LINKS_COMMIT, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  UPDATE_EXTRACTED_CONTENTS, PIN_LINK_COMMIT, UPDATE_CUSTOM_DATA_COMMIT, DELETE_ALL_DATA,
  RESET_STATE,
} from '../types/actionTypes';
import { isObject, createLinkFPath, getArraysPerKey } from '../utils';

const initialState = {};

const fetchedReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === CACHE_FETCHED) {
    const { payload } = action;
    return { ...state, [payload.lnOrQt]: { payload } };
  }

  if (action.type === UPDATE_FETCHED) {
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

  if (action.type === ADD_LINKS_COMMIT) {
    const { successListNames, successLinks } = action.payload;

    const linksPerLn = getArraysPerKey(successListNames, successLinks);

    const newState = { ...state };
    for (const [listName, lnLinks] of Object.entries(linksPerLn)) {
      if (!newState[listName]) continue;

      const { payload } = newState[listName];

      const fpaths = lnLinks.map(link => createLinkFPath(listName, link.id));
      const newLinks = { ...payload.links };
      newLinks[listName] = { ...newLinks[listName] };
      for (const link of lnLinks) newLinks[listName][link.id] = { ...link };

      const newPayload = { ...payload };
      newPayload.unfetchedLinkFPaths = _append(newPayload.unfetchedLinkFPaths, fpaths);
      newPayload.links = newLinks;

      newState[listName] = { payload: newPayload };
    }

    return newState;
  }

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

  if (action.type === UPDATE_EXTRACTED_CONTENTS) {
    const { successListNames, successLinks } = action.payload;

    const successLinksPerLn = getArraysPerKey(successListNames, successLinks);

    const newState = { ...state };
    for (const [listName, lnLinks] of Object.entries(successLinksPerLn)) {
      if (!newState[listName]) continue;

      const { payload } = newState[listName];

      const newLinks = { ...payload.links };
      newLinks[listName] = { ...newLinks[listName] };

      const prevFPaths = [], fpaths = [];
      for (const link of lnLinks) {
        const fromLink = newLinks[listName][link.fromId];
        if (!isObject(fromLink)) continue;

        prevFPaths.push(createLinkFPath(listName, fromLink.id));
        fpaths.push(createLinkFPath(listName, link.id));

        delete newLinks[listName][link.fromId];
        newLinks[listName][link.id] = {
          ...fromLink, id: link.id, extractedResult: link.extractedResult,
        };
      }

      const newPayload = { ...payload };
      newPayload.unfetchedLinkFPaths = newPayload.unfetchedLinkFPaths.filter(fpath => {
        return !prevFPaths.includes(fpath);
      });
      newPayload.unfetchedLinkFPaths = _append(newPayload.unfetchedLinkFPaths, fpaths);
      newPayload.links = newLinks;

      newState[listName] = { payload: newPayload };
    }

    return newState;
  }

  if (action.type === PIN_LINK_COMMIT) {
    const { listNames, links } = action.payload;
    if (!Array.isArray(listNames) || !Array.isArray(links)) return state;

    const linksPerLn = getArraysPerKey(listNames, links);

    const newState = { ...state };
    for (const [listName, lnLinks] of Object.entries(linksPerLn)) {
      if (!newState[listName]) continue;

      const { payload } = newState[listName];

      const fpaths = lnLinks.map(link => createLinkFPath(listName, link.id));
      const newLinks = { ...payload.links };
      newLinks[listName] = { ...newLinks[listName] };
      for (const link of lnLinks) newLinks[listName][link.id] = { ...link };

      const newPayload = { ...payload };
      newPayload.unfetchedLinkFPaths = _append(newPayload.unfetchedLinkFPaths, fpaths);
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

    const prevFPaths = [], fpaths = [];
    if (fromLink.id in newLinks[listName]) {
      prevFPaths.push(createLinkFPath(listName, fromLink.id));
      fpaths.push(createLinkFPath(listName, toLink.id));

      delete newLinks[listName][fromLink.id];
      newLinks[listName][toLink.id] = { ...toLink };
    }

    const newPayload = { ...payload };
    newPayload.unfetchedLinkFPaths = newPayload.unfetchedLinkFPaths.filter(fpath => {
      return !prevFPaths.includes(fpath);
    });
    newPayload.unfetchedLinkFPaths = _append(newPayload.unfetchedLinkFPaths, fpaths);
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
