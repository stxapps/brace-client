import { REHYDRATE } from 'redux-persist/constants';

import {
  REHYDRATE_STATIC_FILES, FETCH_COMMIT, FETCH_MORE_COMMIT, UPDATE_IMAGES,
  UPDATE_CUSTOM_DATA_COMMIT, DELETE_LINKS_COMMIT, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  CLEAN_UP_STATIC_FILES_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { CD_ROOT } from '../types/const';
import { getMainId, extractFPath } from '../utils';

const initialState = {};

const imagesReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (
    action.type === REHYDRATE_STATIC_FILES ||
    action.type === FETCH_COMMIT ||
    action.type === FETCH_MORE_COMMIT
  ) {
    const { images } = action.payload;
    return { ...state, ...images };
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
    action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT ||
    action.type === CLEAN_UP_STATIC_FILES_COMMIT
  ) {
    const { ids } = action.payload;
    const mainIds = ids.map(id => getMainId(id));

    const newState = {};
    for (const fpath in state) {
      const { id } = extractFPath(fpath);
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
