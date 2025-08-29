import { REHYDRATE } from 'redux-persist/constants';

import {
  FETCH_COMMIT, MERGE_SETTINGS, MERGE_SETTINGS_COMMIT, MERGE_SETTINGS_ROLLBACK,
  UPDATE_POPUP, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { SETTINGS_POPUP, MERGING, DIED_MERGING } from '../types/const';

const initialState = {
  contents: [],
  status: null,
};

const conflictedSettingsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === FETCH_COMMIT) {
    const { doFetchStgsAndInfo, conflictedSettings } = action.payload;
    if (!doFetchStgsAndInfo) return state;

    return { ...state, contents: [...conflictedSettings] };
  }

  if (action.type === MERGE_SETTINGS) {
    return { ...state, status: MERGING };
  }

  if (action.type === MERGE_SETTINGS_COMMIT) {
    return { ...initialState };
  }

  if (action.type === MERGE_SETTINGS_ROLLBACK) {
    return { ...state, status: DIED_MERGING };
  }

  if (action.type === UPDATE_POPUP) {
    const { id, isShown } = action.payload;

    if ([SETTINGS_POPUP].includes(id) && isShown) {
      if (state.status === DIED_MERGING) return { ...state, status: null };
    }
    return state;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default conflictedSettingsReducer;
