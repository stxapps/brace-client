import { REHYDRATE } from 'redux-persist/constants';

import {
  CACHE_FETCHED, UPDATE_FETCHED, REFRESH_FETCHED, ADD_LINKS_COMMIT,
  MOVE_LINKS_ADD_STEP_COMMIT, DELETE_LINKS_COMMIT, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  UPDATE_EXTRACTED_CONTENTS, PIN_LINK_COMMIT, UPDATE_CUSTOM_DATA_COMMIT,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { isObject, getArraysPerKey, getMainId, extractLinkId } from '../utils';

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

      const metas = lnLinks.map(link => {
        const { id } = link;
        const { addedDT, updatedDT } = extractLinkId(id)
        return { id, addedDT, updatedDT, fpaths: [], listName };
      });
      const newLinks = { ...payload.links };
      newLinks[listName] = { ...newLinks[listName] };
      for (const link of lnLinks) newLinks[listName][link.id] = { ...link };

      const newPayload = { ...payload };
      newPayload.unfetchedLinkMetas = _append(newPayload.unfetchedLinkMetas, metas);
      newPayload.links = newLinks;

      newState[listName] = { payload: newPayload };
    }

    return newState;
  }

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

  if (action.type === UPDATE_EXTRACTED_CONTENTS) {
    const { successListNames, successLinks } = action.payload;

    const successLinksPerLn = getArraysPerKey(successListNames, successLinks);

    const newState = { ...state };
    for (const [listName, lnLinks] of Object.entries(successLinksPerLn)) {
      if (!newState[listName]) continue;

      const { payload } = newState[listName];

      const newLinks = { ...payload.links };
      newLinks[listName] = { ...newLinks[listName] };

      const metas = [], fromIds = [];
      for (const link of lnLinks) {
        const fromLink = newLinks[listName][link.fromId];
        if (!isObject(fromLink)) continue;

        const { id } = link;
        const { addedDT, updatedDT } = extractLinkId(id);
        metas.push({ id, addedDT, updatedDT, fpaths: [], listName });
        fromIds.push(fromLink.id);

        delete newLinks[listName][link.fromId];
        newLinks[listName][link.id] = {
          ...fromLink, id: link.id, extractedResult: link.extractedResult,
        };
      }

      const newPayload = { ...payload };
      newPayload.unfetchedLinkMetas = newPayload.unfetchedLinkMetas.filter(meta => {
        return !fromIds.includes(meta.id);
      });
      newPayload.unfetchedLinkMetas = _append(newPayload.unfetchedLinkMetas, metas);
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

      const metas = lnLinks.map(link => {
        const { id } = link;
        const { addedDT, updatedDT } = extractLinkId(id);
        return { id, addedDT, updatedDT, fpaths: [], listName };
      });
      const newLinks = { ...payload.links };
      newLinks[listName] = { ...newLinks[listName] };
      for (const link of lnLinks) newLinks[listName][link.id] = { ...link };

      const newPayload = { ...payload };
      newPayload.unfetchedLinkMetas = _append(newPayload.unfetchedLinkMetas, metas);
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

export default fetchedReducer;
