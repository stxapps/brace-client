import { REHYDRATE } from 'redux-persist/constants';

import {
  CACHE_FETCHED, UPDATE_FETCHED,
  ADD_LINKS_COMMIT, DELETE_LINKS_COMMIT, MOVE_LINKS_DELETE_STEP_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_COMMIT, EXTRACT_CONTENTS_COMMIT,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

const initialState = {};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === CACHE_FETCHED) {
    const { payload, theMeta: meta } = action;
    return { ...state, [payload.listName]: { payload, meta } };
  }

  if (action.type === UPDATE_FETCHED) {
    const { listName } = action.payload;

    const newState = {};
    for (const k in state) {
      if (k !== listName) newState[k] = state[k];
    }

    return newState;
  }

  if (action.type === ADD_LINKS_COMMIT) {
    const { listName, links } = action.payload;
    if (!state[listName]) return state;

    const { payload, meta } = state[listName];
    const newPayload = { ...payload, links: [...payload.links, ...links] };

    return { ...state, [listName]: { payload: newPayload, meta } };
  }

  if (
    action.type === DELETE_LINKS_COMMIT ||
    action.type === MOVE_LINKS_DELETE_STEP_COMMIT ||
    action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT
  ) {
    const { listName, ids } = action.payload;
    if (!state[listName]) return state;

    const { payload, meta } = state[listName];
    const newPayload = {
      ...payload,
      links: payload.links.filter(l => !ids.includes(l.id)),
    };

    return { ...state, [listName]: { payload: newPayload, meta } };
  }

  if (action.type === EXTRACT_CONTENTS_COMMIT) {
    const { listName, links } = action.payload;
    if (!state[listName]) return state;

    const linkObjs = {};
    for (const link of links) {
      linkObjs[link.id] = link;
    }

    const { payload, meta } = state[listName];

    const newPayload = {
      ...payload,
      links: payload.links.map(l => {
        if (l.id in linkObjs) return linkObjs[l.id];
        return l;
      }),
    };

    return { ...state, [listName]: { payload: newPayload, meta } };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
