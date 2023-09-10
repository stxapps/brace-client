import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_FETCHED, UPDATE_FETCHED_MORE, SET_SHOWING_LINK_IDS, DELETE_LINKS_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_COMMIT, UPDATE_IMAGES, UPDATE_CUSTOM_DATA_COMMIT,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { CD_ROOT } from '../types/const';
import { getMainId, extractStaticFPath, getStaticFPath } from '../utils';

const initialState = {};

const imagesReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === UPDATE_FETCHED || action.type === SET_SHOWING_LINK_IDS) {
    if ('images' in action.payload) {
      return { ...action.payload.images };
    }
    return state;
  }

  if (action.type === UPDATE_FETCHED_MORE) {
    if ('images' in action.payload) {
      return { ...state, ...action.payload.images };
    }
    return state;
  }

  if (action.type === UPDATE_IMAGES) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_CUSTOM_DATA_COMMIT) {
    const { localUnusedFPaths } = action.payload;

    // Can't delete by mainId as the link may exist,
    //   just change from old image to a new one.
    const cfpaths = localUnusedFPaths.map(fpath => CD_ROOT + '/' + fpath);

    const newState = {};
    for (const fpath in state) {
      if (cfpaths.includes(fpath)) continue;
      newState[fpath] = state[fpath];
    }
    return newState;
  }

  if (
    action.type === DELETE_LINKS_COMMIT ||
    action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT
  ) {
    const { successIds } = action.payload;
    const mainIds = successIds.map(id => getMainId(id));

    const newState = {};
    for (const fpath in state) {
      const { id } = extractStaticFPath(getStaticFPath(fpath));
      if (mainIds.includes(getMainId(id))) continue;
      newState[fpath] = state[fpath];
    }
    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default imagesReducer;
